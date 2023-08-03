/**
 * Creates a texture from a render
 *
 * @remarks
 * This node can be useful when you want to use what a camera sees as a texture.
 *
 */
import {
	ColorSpace,
	WebGLRenderer,
	WebGLRenderTarget,
	OrthographicCamera,
	FloatType,
	HalfFloatType,
	RGBAFormat,
	NearestFilter,
	LinearFilter,
	ClampToEdgeWrapping,
	PerspectiveCamera,
	Vector2,
	Object3D,
	Scene,
} from 'three';
import {TypedCopNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {BaseNodeType} from '../_Base';
import {CopRendererController} from './utils/RendererController';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {DataTextureController, DataTextureControllerBufferType} from './utils/DataTextureController';
import {TextureParamsController, TextureParamConfig} from './utils/TextureParamsController';
import {CoreUserAgent} from '../../../core/UserAgent';
import {Poly} from '../../Poly';
import {Constructor} from '../../../types/GlobalTypes';
import {isObject3D} from '../../../core/geometry/ObjectContent';
import {CoreCameraPerspectiveFrameMode} from '../../../core/camera/frameMode/CoreCameraPerspectiveFrameMode';
import {CoreCameraOrthographicFrameMode} from '../../../core/camera/frameMode/CoreCameraOrthographicFrameMode';

const _v2 = new Vector2();

export function RenderCopNodeParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param path to the main camera object that will be used when the scene loads outside of the editor */
		cameraPath = ParamConfig.STRING('*perspectiveCamera*', {
			objectMask: true,
		});
		/** @param objects to render */
		objects = ParamConfig.STRING('/', {
			objectMask: true,
		});
		/** @param use same resolution as renderer */
		useRendererRes = ParamConfig.BOOLEAN(1);
		/** @param render resolution */
		resolution = ParamConfig.VECTOR2([1024, 1024], {
			visibleIf: {
				useRendererRes: 0,
			},
		});
		/** @param use a data texture instead of a render target, which can be useful when using that texture as and envMap */
		useDataTexture = ParamConfig.BOOLEAN(0);
		/** @param render button */
		render = ParamConfig.BUTTON(null, {
			callback: (node: BaseNodeType) => {
				RenderCopNode.PARAM_CALLBACK_render(node as RenderCopNode);
			},
		});
	};
}
class RenderCopParamConfig extends TextureParamConfig(RenderCopNodeParamConfig(NodeParamsConfig)) {}

const ParamsConfig = new RenderCopParamConfig();

export class RenderCopNode extends TypedCopNode<RenderCopParamConfig> {
	override paramsConfig = ParamsConfig;
	static override type(): Readonly<'render'> {
		return 'render';
	}
	public readonly textureParamsController: TextureParamsController = new TextureParamsController(this);

	private _renderScene: Scene = new Scene();
	private _textureCamera: OrthographicCamera | PerspectiveCamera | undefined;
	private _renderTarget: WebGLRenderTarget | undefined;
	private _rendererController: CopRendererController | undefined;
	private _dataTextureController: DataTextureController | undefined;

	override async cook() {
		const camera = await this._getCamera();
		this._textureCamera = camera;
		if (this._textureCamera) {
			await this.renderOnTarget();
		} else {
			this.cookController.endCook();
		}
	}

	//
	//
	// RENDER + RENDER TARGET
	//
	//
	private _getCameraSync() {
		return this.scene().objectsController.findObjectByMask(this.pv.cameraPath) as
			| OrthographicCamera
			| PerspectiveCamera
			| undefined;
	}
	private async _getCamera(): Promise<PerspectiveCamera | OrthographicCamera | undefined> {
		const camera = this._getCameraSync();
		if (camera) {
			return camera;
		}
		return new Promise((resolve) => {
			this.scene().camerasController.onCameraObjectsUpdated(async () => {
				const camera = this._getCameraSync();
				if (camera) {
					resolve(camera);
				}
			});
		});
	}

	async renderOnTarget() {
		const camera = this._textureCamera;
		if (!camera) {
			this.states.error.set(`no camera found`);
			return;
		}

		this._rendererController = this._rendererController || new CopRendererController(this);
		const renderer = await this._rendererController.waitForRenderer();
		if (!(renderer instanceof WebGLRenderer)) {
			this.states.error.set(`no renderer found`);
			return;
		}
		await this.createRenderTargetIfRequired(renderer);
		if (!this._renderTarget) {
			this.states.error.set(`no renderTarget`);
			return;
		}
		const viewer = this.scene().viewersRegister.lastRenderedViewer();
		if (!viewer) {
			this.states.error.set(`no viewer found`);
			return;
		}
		const viewerCamera = viewer.camera();
		if (!viewerCamera) {
			this.states.error.set(`no viewer camera found`);
			return;
		}
		this._requestedResolution(renderer, _v2);
		const aspect = _v2.x / _v2.y;
		if (camera instanceof PerspectiveCamera && viewerCamera instanceof PerspectiveCamera) {
			CoreCameraPerspectiveFrameMode.updateCameraAspect(camera, aspect, viewerCamera);
		} else {
			if (camera instanceof OrthographicCamera && viewerCamera instanceof OrthographicCamera) {
				CoreCameraOrthographicFrameMode.updateCameraAspect(camera, aspect, viewerCamera);
			}
		}

		const renderedObjects = this.scene().objectsController.objectsByMask(this.pv.objects).filter(isObject3D);
		//
		const previousParentByObject: WeakMap<Object3D, Object3D | null> = new WeakMap();
		for (const renderedObject of renderedObjects) {
			previousParentByObject.set(renderedObject, renderedObject.parent);
			this._renderScene.attach(renderedObject);
		}

		//
		const prevTarget = renderer.getRenderTarget();
		const prevColorSpace = renderer.outputColorSpace;
		const prevBackground = this.scene().threejsScene().background;
		this.scene().threejsScene().background = null;
		renderer.setRenderTarget(this._renderTarget);
		renderer.outputColorSpace = this.pv.colorSpace as ColorSpace;
		renderer.clear();
		renderer.render(this._renderScene, camera);

		// restore
		this.scene().threejsScene().background = prevBackground;
		renderer.setRenderTarget(prevTarget);
		renderer.outputColorSpace = prevColorSpace;
		// restore object
		for (const renderedObject of renderedObjects) {
			const previousParent = previousParentByObject.get(renderedObject);
			if (previousParent) {
				previousParent.attach(renderedObject);
			}
		}

		if (this._renderTarget.texture) {
			if (isBooleanTrue(this.pv.useDataTexture)) {
				this._dataTextureController =
					this._dataTextureController ||
					new DataTextureController(DataTextureControllerBufferType.Float32Array);
				const dataTexture = this._dataTextureController.fromRenderTarget(renderer, this._renderTarget);
				await this.textureParamsController.update(dataTexture);
				this.setTexture(dataTexture);
			} else {
				this.setTexture(this._renderTarget.texture);
				await this.textureParamsController.update(this._renderTarget.texture);
			}
		} else {
			this.cookController.endCook();
		}
	}

	async renderTarget(renderer: WebGLRenderer) {
		return (this._renderTarget = this._renderTarget || (await this._createRenderTarget(renderer)));
	}
	private async createRenderTargetIfRequired(renderer: WebGLRenderer) {
		if (!this._renderTarget || !this._renderTargetResolutionValid(renderer)) {
			this._renderTarget = await this._createRenderTarget(renderer);
			this._dataTextureController?.reset();
		}
	}
	private _requestedResolution(renderer: WebGLRenderer, target: Vector2) {
		if (isBooleanTrue(this.pv.useRendererRes)) {
			renderer.getSize(target);
		} else {
			target.copy(this.pv.resolution);
		}
	}
	private _renderTargetResolutionValid(renderer: WebGLRenderer) {
		if (this._renderTarget) {
			const image = this._renderTarget.texture.image;
			this._requestedResolution(renderer, _v2);
			return (image.width = _v2.x && image.height == _v2.y);
		} else {
			return false;
		}
	}

	private async _createRenderTarget(renderer: WebGLRenderer) {
		this._requestedResolution(renderer, _v2);
		if (this._renderTarget) {
			const image = this._renderTarget.texture.image;
			if (image.width == _v2.x && image.height == _v2.y) {
				return this._renderTarget;
			}
		}

		const wrapS = ClampToEdgeWrapping;
		const wrapT = ClampToEdgeWrapping;

		const minFilter = LinearFilter;
		const magFilter = NearestFilter;

		var renderTarget = new WebGLRenderTarget(_v2.x, _v2.y, {
			wrapS,
			wrapT,
			minFilter,
			magFilter,
			format: RGBAFormat,
			generateMipmaps: true,
			type: CoreUserAgent.isiOS() ? HalfFloatType : FloatType,
			samples: renderer.getPixelRatio(),
			stencilBuffer: false,
			depthBuffer: false,
		});
		await this.textureParamsController.update(renderTarget.texture);
		Poly.warn('created render target', this.path(), _v2.x, _v2.y);
		return renderTarget;
	}

	//
	//
	// CALLBACK
	//
	//
	static PARAM_CALLBACK_render(node: RenderCopNode) {
		node.renderOnTarget();
	}
}

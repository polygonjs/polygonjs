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
import {CoreCameraPerspectiveFrameMode} from '../../../core/camera/frameMode/CoreCameraPerspectiveFrameMode';
import {CoreCameraOrthographicFrameMode} from '../../../core/camera/frameMode/CoreCameraOrthographicFrameMode';
import {CopType} from '../../poly/registers/nodes/types/Cop';

const _v2 = new Vector2();

export function RenderCopNodeParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param path to the main camera object that will be used when the scene loads outside of the editor */
		cameraPath = ParamConfig.STRING('*perspectiveCamera*', {
			objectMask: true,
		});
		/** @param transparent background */
		transparentBackground = ParamConfig.BOOLEAN(1);
		/** @param bg Color */
		backgroundColor = ParamConfig.COLOR([0, 0, 0], {
			visibleIf: {
				transparentBackground: 0,
			},
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
		/** @param autoRender */
		autoRender = ParamConfig.BOOLEAN(1);
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
	static override type(): Readonly<CopType.RENDER> {
		return CopType.RENDER;
	}
	public readonly textureParamsController: TextureParamsController = new TextureParamsController(this);

	// private _renderTarget: WebGLRenderTarget | undefined;
	private _rendererController: CopRendererController | undefined;
	private _dataTextureController: DataTextureController | undefined;
	private _renderTargetByRenderer: WeakMap<WebGLRenderer, WebGLRenderTarget> = new WeakMap();
	override async cook() {
		if (isBooleanTrue(this.pv.autoRender)) {
			this._addOnBeforeTickCallback();
		} else {
			this._removeOnBeforeTickCallback();
		}

		const camera = await this._getCamera();
		if (camera) {
			await this.renderOnTarget();
		} else {
			this.cookController.endCook();
		}
	}

	//
	//
	// AUTO RENDER
	//
	//
	private _addOnBeforeTickCallback() {
		const callbackName = this._onBeforeRenderCallbackName();
		if (this.scene().hasBeforeTickCallback(callbackName)) {
			return;
		}
		this.scene().registerOnBeforeTick(callbackName, this._renderOnTargetBound);
	}
	private _removeOnBeforeTickCallback() {
		this.scene().unRegisterOnBeforeTick(this._onBeforeRenderCallbackName());
	}
	private _onBeforeRenderCallbackName() {
		return `cop/render_onBeforeTickCallback-${this.graphNodeId()}`;
	}
	override dispose() {
		super.dispose();
		this._removeOnBeforeTickCallback();
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

	private _renderOnTargetBound = this.renderOnTarget.bind(this);
	async renderOnTarget() {
		const camera = await this._getCamera();
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

		const renderTarget = await this.createRenderTargetIfRequired(renderer);

		this._ensureRenderTargetResolutionValid(renderer, renderTarget);
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

		const scene = this.scene().threejsScene();
		// save state
		const prevTarget = renderer.getRenderTarget();
		const prevColorSpace = renderer.outputColorSpace;
		const prevBackground = scene.background;
		scene.background = this.pv.transparentBackground ? null : this.pv.backgroundColor;
		renderer.setRenderTarget(renderTarget);
		renderer.outputColorSpace = this.pv.colorSpace as ColorSpace;

		// render
		renderer.clear();
		renderer.render(scene, camera);

		// restore state
		renderer.setRenderTarget(prevTarget);
		renderer.outputColorSpace = prevColorSpace;
		scene.background = prevBackground;

		// set texture
		// Note: this cannot be done just in the cook method,
		// since a window resize will require the re-creation of the renderTarget
		// and therefore of the texture.
		if (renderTarget.texture) {
			if (isBooleanTrue(this.pv.useDataTexture)) {
				this._dataTextureController =
					this._dataTextureController ||
					new DataTextureController(DataTextureControllerBufferType.Float32Array);
				const dataTexture = this._dataTextureController.fromRenderTarget(renderer, renderTarget);
				await this.textureParamsController.update(dataTexture);
				this.setTexture(dataTexture);
				return;
			} else {
				this.setTexture(renderTarget.texture);
				await this.textureParamsController.update(renderTarget.texture);
				return;
			}
		}
	}

	async renderTarget(renderer: WebGLRenderer) {
		return this._renderTargetByRenderer.get(renderer);
	}
	private async createRenderTargetIfRequired(renderer: WebGLRenderer) {
		let renderTarget = this._renderTargetByRenderer.get(renderer);
		if (!renderTarget) {
			renderTarget = await this._createRenderTarget(renderer);
			this._renderTargetByRenderer.set(renderer, renderTarget);
		}
		return renderTarget;
	}
	private _requestedResolution(renderer: WebGLRenderer, target: Vector2) {
		if (isBooleanTrue(this.pv.useRendererRes)) {
			renderer.getSize(target);
		} else {
			target.copy(this.pv.resolution);
		}
	}
	private _ensureRenderTargetResolutionValid(renderer: WebGLRenderer, renderTarget: WebGLRenderTarget) {
		this._requestedResolution(renderer, _v2);
		const image = renderTarget.texture.image;
		if (image.width != _v2.x || image.height != _v2.y) {
			renderTarget.setSize(_v2.x, _v2.y);
		}
	}

	private async _createRenderTarget(renderer: WebGLRenderer) {
		this._requestedResolution(renderer, _v2);

		const wrapS = ClampToEdgeWrapping;
		const wrapT = ClampToEdgeWrapping;

		const minFilter = LinearFilter;
		const magFilter = NearestFilter;

		const renderTarget = new WebGLRenderTarget(_v2.x, _v2.y, {
			wrapS,
			wrapT,
			minFilter,
			magFilter,
			format: RGBAFormat,
			generateMipmaps: true,
			type: CoreUserAgent.isiOS() ? HalfFloatType : FloatType,
			samples: renderer.getPixelRatio(),
			stencilBuffer: true,
			depthBuffer: true,
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

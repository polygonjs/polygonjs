/**
 * Creates a texture from a render
 *
 * @remarks
 * This node can be useful when you want to use what a camera sees as a texture.
 *
 */
import {WebGLRenderTarget} from 'three';
import {FloatType, HalfFloatType, RGBAFormat, NearestFilter, LinearFilter, ClampToEdgeWrapping} from 'three';
import {TypedCopNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CameraNodeType, NodeContext, CAMERA_TYPES} from '../../poly/NodeContext';
import {BaseNodeType} from '../_Base';
import {TypedCameraObjNode} from '../obj/_BaseCamera';
import {CopRendererController} from './utils/RendererController';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {DataTextureController, DataTextureControllerBufferType} from './utils/DataTextureController';
import {TextureParamsController, TextureParamConfig} from './utils/TextureParamsController';
import {CoreUserAgent} from '../../../core/UserAgent';
import {Poly} from '../../Poly';
import {Constructor} from '../../../types/GlobalTypes';
import {OrthographicCamera} from 'three';
import {PerspectiveCamera} from 'three';

export function RenderCopNodeParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param camera to render from */
		camera = ParamConfig.NODE_PATH('', {
			nodeSelection: {
				context: NodeContext.OBJ,
				types: CAMERA_TYPES,
			},
		});
		/** @param render resolution */
		resolution = ParamConfig.VECTOR2([1024, 1024]);
		/** @param defines if the shader is rendered via the same camera used to render the scene */
		useCameraRenderer = ParamConfig.BOOLEAN(1); // needs to be 1, as it does not work on firefox otherwise
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

	private _textureCamera: OrthographicCamera | PerspectiveCamera | undefined;
	private _cameraNode: TypedCameraObjNode<any, any> | undefined;
	private _renderTarget: WebGLRenderTarget | undefined;
	private _rendererController: CopRendererController | undefined;
	private _dataTextureController: DataTextureController | undefined;

	override async cook() {
		this._cameraNode = this.pv.camera.nodeWithContext(NodeContext.OBJ) as TypedCameraObjNode<any, any>;
		// Walker.find_node(<unknown>this as Node, this._param_camera)
		if (this._cameraNode && CAMERA_TYPES.includes(this._cameraNode.type() as CameraNodeType)) {
			this._textureCamera = this._cameraNode.object as OrthographicCamera | PerspectiveCamera;
			await this._cameraNode.compute();
			// this.start_animate();
			this.renderOnTarget();
		} else {
			this._textureCamera = undefined;
		}
	}

	//
	//
	// RENDER + RENDER TARGET
	//
	//
	async renderOnTarget() {
		await this.createRenderTargetIfRequired();
		if (!(this._renderTarget && this._textureCamera)) {
			return;
		}

		this._rendererController = this._rendererController || new CopRendererController(this);
		const renderer = await this._rendererController.waitForRenderer();

		const prevTarget = renderer.getRenderTarget();
		const prevEncoding = renderer.outputEncoding;
		renderer.setRenderTarget(this._renderTarget);
		renderer.outputEncoding = this.pv.encoding;
		// this._texture_camera.updateMatrix();
		// this._texture_camera.updateMatrixWorld();
		// this._texture_camera.updateWorldMatrix(true, true);
		// this._texture_camera.updateProjectionMatrix();
		// this._texture_scene.updateWorldMatrix(true, true);
		renderer.clear();
		renderer.render(this.scene().threejsScene(), this._textureCamera);
		renderer.setRenderTarget(prevTarget);
		renderer.outputEncoding = prevEncoding;

		if (this._renderTarget.texture) {
			if (isBooleanTrue(this.pv.useCameraRenderer)) {
				this.setTexture(this._renderTarget.texture);
				await this.textureParamsController.update(this._renderTarget.texture);
			} else {
				this._dataTextureController =
					this._dataTextureController ||
					new DataTextureController(DataTextureControllerBufferType.Float32Array);
				const dataTexture = this._dataTextureController.from_render_target(renderer, this._renderTarget);
				await this.textureParamsController.update(dataTexture);
				this.setTexture(dataTexture);
			}
		} else {
			this.cookController.endCook();
		}
	}

	async renderTarget() {
		return (this._renderTarget =
			this._renderTarget || (await this._createRenderTarget(this.pv.resolution.x, this.pv.resolution.y)));
	}
	private async createRenderTargetIfRequired() {
		if (!this._renderTarget || !this._renderTargetResolutionValid()) {
			this._renderTarget = await this._createRenderTarget(this.pv.resolution.x, this.pv.resolution.y);
			this._dataTextureController?.reset();
		}
	}
	private _renderTargetResolutionValid() {
		if (this._renderTarget) {
			const image = this._renderTarget.texture.image;
			if (image.width != this.pv.resolution.x || image.height != this.pv.resolution.y) {
				return false;
			} else {
				return true;
			}
		} else {
			return false;
		}
	}

	private async _createRenderTarget(width: number, height: number) {
		if (this._renderTarget) {
			const image = this._renderTarget.texture.image;
			if (image.width == width && image.height == height) {
				return this._renderTarget;
			}
		}

		const wrapS = ClampToEdgeWrapping;
		const wrapT = ClampToEdgeWrapping;

		const minFilter = LinearFilter;
		const magFilter = NearestFilter;

		var renderTarget = new WebGLRenderTarget(width, height, {
			wrapS,
			wrapT,
			minFilter,
			magFilter,
			format: RGBAFormat,
			generateMipmaps: true,
			type: CoreUserAgent.isiOS() ? HalfFloatType : FloatType,
			stencilBuffer: false,
			depthBuffer: false,
		});
		await this.textureParamsController.update(renderTarget.texture);
		Poly.warn('created render target', this.path(), width, height);
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

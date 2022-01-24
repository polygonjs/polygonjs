/**
 * Creates a texture from a render
 *
 * @remarks
 * This node can be useful when you want to use what a camera sees as a texture.
 *
 */
import {Scene} from 'three/src/scenes/Scene';
import {WebGLRenderTarget} from 'three/src/renderers/WebGLRenderTarget';
import {
	FloatType,
	HalfFloatType,
	RGBAFormat,
	NearestFilter,
	LinearFilter,
	ClampToEdgeWrapping,
} from 'three/src/constants';
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
import {OrthographicCamera} from 'three/src/cameras/OrthographicCamera';
import {PerspectiveCamera} from 'three/src/cameras/PerspectiveCamera';

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
		useCameraRenderer = ParamConfig.BOOLEAN(1);
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

	private _texture_camera: OrthographicCamera | PerspectiveCamera | undefined;
	private _texture_scene: Scene | undefined;
	private _camera_node: TypedCameraObjNode<any, any> | undefined;
	private _render_target: WebGLRenderTarget | undefined;
	private _renderer_controller: CopRendererController | undefined;
	private _data_texture_controller: DataTextureController | undefined;

	override async cook() {
		this._texture_scene = this.scene().threejsScene();

		this._camera_node = this.pv.camera.nodeWithContext(NodeContext.OBJ) as TypedCameraObjNode<any, any>;
		// Walker.find_node(<unknown>this as Node, this._param_camera)
		if (this._camera_node && CAMERA_TYPES.includes(this._camera_node.type() as CameraNodeType)) {
			this._texture_camera = this._camera_node.object as OrthographicCamera | PerspectiveCamera;
			await this._camera_node.compute();
			// this.start_animate();
			this.renderOnTarget();
		} else {
			this._texture_camera = undefined;
		}
	}

	//
	//
	// RENDER + RENDER TARGET
	//
	//
	async renderOnTarget() {
		await this.createRenderTargetIfRequired();
		if (!(this._render_target && this._texture_scene && this._texture_camera)) {
			return;
		}

		this._renderer_controller = this._renderer_controller || new CopRendererController(this);
		const renderer = await this._renderer_controller.renderer();

		const prev_target = renderer.getRenderTarget();
		renderer.setRenderTarget(this._render_target);
		// this._texture_camera.updateMatrix();
		// this._texture_camera.updateMatrixWorld();
		// this._texture_camera.updateWorldMatrix(true, true);
		// this._texture_camera.updateProjectionMatrix();
		// this._texture_scene.updateWorldMatrix(true, true);
		renderer.clear();
		renderer.render(this._texture_scene, this._texture_camera);
		renderer.setRenderTarget(prev_target);

		if (this._render_target.texture) {
			if (isBooleanTrue(this.pv.useCameraRenderer)) {
				this.setTexture(this._render_target.texture);
			} else {
				this._data_texture_controller =
					this._data_texture_controller ||
					new DataTextureController(DataTextureControllerBufferType.Float32Array);
				const data_texture = this._data_texture_controller.from_render_target(renderer, this._render_target);
				await this.textureParamsController.update(data_texture);
				this.setTexture(data_texture);
			}
		} else {
			this.cookController.endCook();
		}
	}

	async renderTarget() {
		return (this._render_target =
			this._render_target || (await this._createRenderTarget(this.pv.resolution.x, this.pv.resolution.y)));
	}
	private async createRenderTargetIfRequired() {
		if (!this._render_target || !this._renderTargetResolutionValid()) {
			this._render_target = await this._createRenderTarget(this.pv.resolution.x, this.pv.resolution.y);
			this._data_texture_controller?.reset();
		}
	}
	private _renderTargetResolutionValid() {
		if (this._render_target) {
			const image = this._render_target.texture.image;
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
		if (this._render_target) {
			const image = this._render_target.texture.image;
			if (image.width == width && image.height == height) {
				return this._render_target;
			}
		}

		const wrapS = ClampToEdgeWrapping;
		const wrapT = ClampToEdgeWrapping;

		const minFilter = LinearFilter;
		const magFilter = NearestFilter;

		var renderTarget = new WebGLRenderTarget(width, height, {
			wrapS: wrapS,
			wrapT: wrapT,
			minFilter: minFilter,
			magFilter: magFilter,
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

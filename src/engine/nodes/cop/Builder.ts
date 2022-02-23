/**
 * Allows to create a shader with GLSL nodes to create the texture values.
 *
 *
 */
import {Constructor, valueof, Number2} from '../../../types/GlobalTypes';
import {WebGLRenderTarget} from 'three/src/renderers/WebGLRenderTarget';
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
import {Scene} from 'three/src/scenes/Scene';
import {
	FloatType,
	HalfFloatType,
	RGBAFormat,
	NearestFilter,
	LinearFilter,
	ClampToEdgeWrapping,
} from 'three/src/constants';
import {PlaneBufferGeometry} from 'three/src/geometries/PlaneGeometry';
import {Mesh} from 'three/src/objects/Mesh';
import {Camera} from 'three/src/cameras/Camera';
import {TypedCopNode} from './_Base';
// import {CoreGraphNode} from '../../../core/graph/CoreGraphNode';
import {GlobalsGeometryHandler} from '../gl/code/globals/Geometry';
import {GlNodeChildrenMap} from '../../poly/registers/nodes/Gl';
import {BaseGlNodeType} from '../gl/_Base';
import {GlNodeFinder} from '../gl/code/utils/NodeFinder';
import {NodeContext} from '../../poly/NodeContext';
import {IUniform} from 'three/src/renderers/shaders/UniformsLib';
export interface IUniforms {
	[uniform: string]: IUniform;
}

const VERTEX_SHADER = `
void main()	{
	gl_Position = vec4( position, 1.0 );
}
`;
const RESOLUTION_DEFAULT: Number2 = [256, 256];

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {DataTextureController, DataTextureControllerBufferType} from './utils/DataTextureController';
import {CopRendererController} from './utils/RendererController';
import {AssemblerName} from '../../poly/registers/assemblers/_BaseRegister';
import {Poly} from '../../Poly';
import {TexturePersistedConfig} from '../gl/code/assemblers/textures/TexturePersistedConfig';
import {IUniformsWithTime} from '../../scene/utils/UniformsController';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {CoreUserAgent} from '../../../core/UserAgent';
import {NodeCreateOptions} from '../utils/hierarchy/ChildrenController';
import {BaseNodeType} from '../_Base';
import {CopType} from '../../poly/registers/nodes/types/Cop';

class BuilderCopParamsConfig extends NodeParamsConfig {
	/** @param texture resolution */
	resolution = ParamConfig.VECTOR2(RESOLUTION_DEFAULT);
	/** @param defines if the shader is rendered via the same camera used to render the scene */
	useCameraRenderer = ParamConfig.BOOLEAN(0);
	/** @param force Render */
	render = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			BuilderCopNode.PARAM_CALLBACK_render(node as BuilderCopNode);
		},
	});
}

const ParamsConfig = new BuilderCopParamsConfig();

export class BuilderCopNode extends TypedCopNode<BuilderCopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return CopType.BUILDER;
	}
	override readonly persisted_config: TexturePersistedConfig = new TexturePersistedConfig(this);
	protected _assemblerController = this._createAssemblerController();

	public override usedAssembler(): Readonly<AssemblerName.GL_TEXTURE> {
		return AssemblerName.GL_TEXTURE;
	}
	protected _createAssemblerController() {
		const assembler_controller = Poly.assemblersRegister.assembler(this, this.usedAssembler());
		if (assembler_controller) {
			const globalsHandler = new GlobalsGeometryHandler();
			assembler_controller.setAssemblerGlobalsHandler(globalsHandler);
			return assembler_controller;
		}
	}

	assemblerController() {
		return this._assemblerController;
	}

	private _texture_mesh: Mesh = new Mesh(new PlaneBufferGeometry(2, 2));
	private _fragment_shader: string | undefined;
	private _uniforms: IUniforms | undefined;
	public readonly texture_material: ShaderMaterial = new ShaderMaterial({
		uniforms: {},
		vertexShader: VERTEX_SHADER,
		fragmentShader: '',
	});
	private _texture_scene: Scene = new Scene();
	private _texture_camera: Camera = new Camera();
	private _render_target: WebGLRenderTarget | undefined;
	private _data_texture_controller: DataTextureController | undefined;
	private _renderer_controller: CopRendererController | undefined;

	protected override _childrenControllerContext = NodeContext.GL;
	override initializeNode() {
		this._texture_mesh.material = this.texture_material;
		this._texture_mesh.scale.multiplyScalar(0.25);
		this._texture_scene.add(this._texture_mesh);
		this._texture_camera.position.z = 1;

		// this ensures the builder recooks when its children are changed
		// and not just when a material that use it requests it
		this.addPostDirtyHook('_cook_main_without_inputs_when_dirty', () => {
			setTimeout(this._cook_main_without_inputs_when_dirty_bound, 0);
		});

		// this.dirtyController.addPostDirtyHook(
		// 	'_reset_if_resolution_changed',
		// 	this._reset_if_resolution_changed.bind(this)
		// );
		// this.params.onParamsCreated('reset', () => {
		// 	this._reset();
		// });
	}

	override createNode<S extends keyof GlNodeChildrenMap>(
		node_class: S,
		options?: NodeCreateOptions
	): GlNodeChildrenMap[S];
	override createNode<K extends valueof<GlNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K;
	override createNode<K extends valueof<GlNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K {
		return super.createNode(node_class, options) as K;
	}
	override children() {
		return super.children() as BaseGlNodeType[];
	}
	override nodesByType<K extends keyof GlNodeChildrenMap>(type: K): GlNodeChildrenMap[K][] {
		return super.nodesByType(type) as GlNodeChildrenMap[K][];
	}
	override childrenAllowed() {
		if (this.assemblerController()) {
			return super.childrenAllowed();
		}
		this.scene().markAsReadOnly(this);
		return false;
	}

	private _cook_main_without_inputs_when_dirty_bound = this._cook_main_without_inputs_when_dirty.bind(this);
	private async _cook_main_without_inputs_when_dirty() {
		await this.cookController.cookMainWithoutInputs();
	}

	// private _reset_if_resolution_changed(trigger?: CoreGraphNode) {
	// 	if (trigger && trigger.graphNodeId() == this.p.resolution.graphNodeId()) {
	// 		this._reset();
	// 	}
	// }

	override async cook() {
		this.compileIfRequired();
		this.renderOnTarget();
	}

	shaders_by_name() {
		return {
			fragment: this._fragment_shader,
		};
	}

	compileIfRequired() {
		if (this.assemblerController()?.compileRequired()) {
			try {
				this.compile();
			} catch (err) {
				const message = (err as any).message || 'failed to compile';
				this.states.error.set(message);
			}
		}
	}
	private compile() {
		const assemblerController = this.assemblerController();
		if (!assemblerController) {
			return;
		}
		const output_nodes: BaseGlNodeType[] = GlNodeFinder.findOutputNodes(this);
		if (output_nodes.length == 0) {
			this.states.error.set('one output node is required');
			return;
		}
		if (output_nodes.length > 1) {
			this.states.error.set('only one output node allowed');
			return;
		}
		const output_node = output_nodes[0];
		if (output_node) {
			//const param_nodes = GlNodeFinder.find_param_generating_nodes(this);
			const root_nodes = output_nodes; //.concat(param_nodes);
			assemblerController.assembler.set_root_nodes(root_nodes);

			// main compilation
			assemblerController.assembler.update_fragment_shader();

			// receives fragment and uniforms
			const fragment_shader = assemblerController.assembler.fragment_shader();
			const uniforms = assemblerController.assembler.uniforms();
			if (fragment_shader && uniforms) {
				this._fragment_shader = fragment_shader;
				this._uniforms = uniforms;
			}

			BuilderCopNode.handleDependencies(this, assemblerController.assembler.uniformsTimeDependent());
		}

		if (this._fragment_shader && this._uniforms) {
			this.texture_material.fragmentShader = this._fragment_shader;
			this.texture_material.uniforms = this._uniforms;
			this.texture_material.needsUpdate = true;
			this.texture_material.uniforms.resolution = {
				value: this.pv.resolution,
			};
		}
		assemblerController.post_compile();
	}

	static handleDependencies(node: BuilderCopNode, timeDependent: boolean, uniforms?: IUniformsWithTime) {
		const scene = node.scene();
		if (timeDependent) {
			if (uniforms) {
				scene.uniformsController.addTimeUniform(uniforms);
			}
			const callbackName = node._callbackName();
			if (!scene.registeredBeforeTickCallbacks().has(callbackName)) {
				scene.registerOnBeforeTick(callbackName, node._boundRenderOnTarget);
			}
		} else {
			node._removeCallbacks();
		}
	}
	private _callbackName() {
		return `cop/builder_${this.graphNodeId()}`;
	}
	// private _uniformCallbackName() {
	// 	return `cop/builder_uniforms_${this.graphNodeId()}`;
	// }
	override dispose() {
		super.dispose();
		this._removeCallbacks();
	}
	private _removeCallbacks() {
		const scene = this.scene();
		// scene.uniformsController.removeTimeUniform(uniforms);
		scene.unRegisterOnBeforeTick(this._callbackName());
	}

	//
	//
	// RENDER + RENDER TARGET
	//
	//
	private _boundRenderOnTarget = this.renderOnTarget.bind(this);
	async renderOnTarget() {
		this.createRenderTargetIfRequired();
		if (!this._render_target) {
			return;
		}

		this._renderer_controller = this._renderer_controller || new CopRendererController(this);
		const renderer = await this._renderer_controller.renderer();

		const prev_target = renderer.getRenderTarget();
		renderer.setRenderTarget(this._render_target);
		renderer.clear();
		renderer.render(this._texture_scene, this._texture_camera);
		renderer.setRenderTarget(prev_target);

		if (this._render_target.texture) {
			if (isBooleanTrue(this.pv.useCameraRenderer)) {
				this.setTexture(this._render_target.texture);
			} else {
				// const w = this.pv.resolution.x;
				// const h = this.pv.resolution.y;
				// this._data_texture = this._data_texture || this._create_data_texture(w, h);
				// renderer.readRenderTargetPixels(this._render_target, 0, 0, w, h, this._data_texture.image.data);
				// this._data_texture.needsUpdate = true;
				this._data_texture_controller =
					this._data_texture_controller ||
					new DataTextureController(DataTextureControllerBufferType.Float32Array);
				const data_texture = this._data_texture_controller.from_render_target(renderer, this._render_target);

				this.setTexture(data_texture);
			}
		} else {
			this.cookController.endCook();
		}
	}

	renderTarget() {
		return (this._render_target =
			this._render_target || this._createRenderTarget(this.pv.resolution.x, this.pv.resolution.y));
	}
	private createRenderTargetIfRequired() {
		if (!this._render_target || !this._renderTargetResolutionValid()) {
			this._render_target = this._createRenderTarget(this.pv.resolution.x, this.pv.resolution.y);
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

	private _createRenderTarget(width: number, height: number) {
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
			type: CoreUserAgent.isiOS() ? HalfFloatType : FloatType,
			stencilBuffer: false,
			depthBuffer: false,
		});
		Poly.warn('created render target', this.path(), width, height);
		return renderTarget;
	}

	static PARAM_CALLBACK_render(node: BuilderCopNode) {
		node.renderOnTarget();
	}
}

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
import {PlaneBufferGeometry} from 'three/src/geometries/PlaneBufferGeometry';
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
import {TexturePersistedConfig} from '../gl/code/assemblers/textures/PersistedConfig';
import {IUniformsWithTime} from '../../scene/utils/UniformsController';
import {ParamsInitData} from '../utils/io/IOController';

class BuilderCopParamsConfig extends NodeParamsConfig {
	/** @param texture resolution */
	resolution = ParamConfig.VECTOR2(RESOLUTION_DEFAULT);
	/** @param defines if the shader is rendered via the same camera used to render the scene */
	useCameraRenderer = ParamConfig.BOOLEAN(0);
}

const ParamsConfig = new BuilderCopParamsConfig();

export class BuilderCopNode extends TypedCopNode<BuilderCopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'builder';
	}
	readonly persisted_config: TexturePersistedConfig = new TexturePersistedConfig(this);
	protected _assembler_controller = this._create_assembler_controller();

	public used_assembler(): Readonly<AssemblerName.GL_TEXTURE> {
		return AssemblerName.GL_TEXTURE;
	}
	protected _create_assembler_controller() {
		const assembler_controller = Poly.assemblersRegister.assembler(this, this.used_assembler());
		if (assembler_controller) {
			const globals_handler = new GlobalsGeometryHandler();
			assembler_controller.set_assembler_globals_handler(globals_handler);
			return assembler_controller;
		}
	}

	get assemblerController() {
		return this._assembler_controller;
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

	protected _children_controller_context = NodeContext.GL;
	initialize_node() {
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
		// this.params.on_params_created('reset', () => {
		// 	this._reset();
		// });
	}

	createNode<S extends keyof GlNodeChildrenMap>(
		node_class: S,
		params_init_value_overrides?: ParamsInitData
	): GlNodeChildrenMap[S];
	createNode<K extends valueof<GlNodeChildrenMap>>(
		node_class: Constructor<K>,
		params_init_value_overrides?: ParamsInitData
	): K;
	createNode<K extends valueof<GlNodeChildrenMap>>(
		node_class: Constructor<K>,
		params_init_value_overrides?: ParamsInitData
	): K {
		return super.createNode(node_class, params_init_value_overrides) as K;
	}
	children() {
		return super.children() as BaseGlNodeType[];
	}
	nodesByType<K extends keyof GlNodeChildrenMap>(type: K): GlNodeChildrenMap[K][] {
		return super.nodesByType(type) as GlNodeChildrenMap[K][];
	}
	childrenAllowed() {
		if (this.assemblerController) {
			return super.childrenAllowed();
		}
		this.scene().mark_as_read_only(this);
		return false;
	}

	private _cook_main_without_inputs_when_dirty_bound = this._cook_main_without_inputs_when_dirty.bind(this);
	private async _cook_main_without_inputs_when_dirty() {
		await this.cookController.cook_main_without_inputs();
	}

	// private _reset_if_resolution_changed(trigger?: CoreGraphNode) {
	// 	if (trigger && trigger.graphNodeId() == this.p.resolution.graphNodeId()) {
	// 		this._reset();
	// 	}
	// }

	async cook() {
		this.compile_if_required();
		this.render_on_target();
	}

	shaders_by_name() {
		return {
			fragment: this._fragment_shader,
		};
	}

	compile_if_required() {
		if (this.assemblerController?.compile_required()) {
			this.compile();
		}
	}
	private compile() {
		const assemblerController = this.assemblerController;
		if (!assemblerController) {
			return;
		}
		const output_nodes: BaseGlNodeType[] = GlNodeFinder.find_output_nodes(this);
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

			BuilderCopNode.handle_dependencies(this, assemblerController.assembler.uniforms_time_dependent());
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

	static handle_dependencies(node: BuilderCopNode, time_dependent: boolean, uniforms?: IUniformsWithTime) {
		// That's actually useless, since this doesn't make the texture recook
		const scene = node.scene();
		const id = node.graphNodeId();
		const id_s = `${id}`;
		if (time_dependent) {
			// TODO: remove this once the scene knows how to re-render
			// the render target if it is .uniforms_time_dependent()
			node.states.time_dependent.force_time_dependent();
			if (uniforms) {
				scene.uniforms_controller.add_time_dependent_uniform_owner(id_s, uniforms);
			}
		} else {
			node.states.time_dependent.unforce_time_dependent();
			scene.uniforms_controller.remove_time_dependent_uniform_owner(id_s);
		}
	}

	async render_on_target() {
		this.create_render_target_if_required();
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
			if (this.pv.useCameraRenderer) {
				this.set_texture(this._render_target.texture);
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

				this.set_texture(data_texture);
			}
		} else {
			this.cookController.end_cook();
		}
	}

	render_target() {
		return (this._render_target =
			this._render_target || this._create_render_target(this.pv.resolution.x, this.pv.resolution.y));
	}
	private create_render_target_if_required() {
		if (!this._render_target || !this._render_target_resolution_valid()) {
			this._render_target = this._create_render_target(this.pv.resolution.x, this.pv.resolution.y);
			this._data_texture_controller?.reset();
		}
	}
	private _render_target_resolution_valid() {
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

	private _create_render_target(width: number, height: number) {
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
			type: /(iPad|iPhone|iPod)/g.test(navigator.userAgent) ? HalfFloatType : FloatType,
			stencilBuffer: false,
			depthBuffer: false,
		});
		Poly.warn('created render target', this.fullPath(), width, height);
		return renderTarget;
	}
}

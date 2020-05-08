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
import {GlAssemblerController} from '../gl/code/Controller';
import {ShaderAssemblerTexture} from '../gl/code/assemblers/textures/Texture';
import {CoreGraphNode} from '../../../core/graph/CoreGraphNode';
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
import {Poly} from '../../Poly';
import {DataTextureController, DataTextureControllerBufferType} from './utils/DataTextureController';

class BuilderCopParamsConfig extends NodeParamsConfig {
	resolution = ParamConfig.VECTOR2(RESOLUTION_DEFAULT);
	use_data_texture = ParamConfig.BOOLEAN(1);
}

const ParamsConfig = new BuilderCopParamsConfig();

export class BuilderCopNode extends TypedCopNode<BuilderCopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'builder';
	}
	protected _assembler_controller: GlAssemblerController<
		ShaderAssemblerTexture
	> = this._create_assembler_controller();

	private _create_assembler_controller() {
		const globals_handler = new GlobalsGeometryHandler();
		const assembler_controller = new GlAssemblerController<ShaderAssemblerTexture>(this, ShaderAssemblerTexture);
		assembler_controller.set_assembler_globals_handler(globals_handler);
		return assembler_controller;
	}

	get assembler_controller() {
		return this._assembler_controller;
	}

	private _texture_mesh: Mesh = new Mesh(new PlaneBufferGeometry(2, 2));
	private _fragment_shader: string | undefined;
	private _uniforms: IUniforms | undefined;
	private _texture_material: ShaderMaterial = new ShaderMaterial({
		uniforms: {},
		vertexShader: VERTEX_SHADER,
		fragmentShader: '',
	});
	private _texture_scene: Scene = new Scene();
	private _texture_camera: Camera = new Camera();
	private _render_target: WebGLRenderTarget = this._create_render_target(
		RESOLUTION_DEFAULT[0],
		RESOLUTION_DEFAULT[1]
	);
	private _data_texture_controller: DataTextureController | undefined;

	protected _children_controller_context = NodeContext.GL;
	initialize_node() {
		this.lifecycle.add_on_create_hook(this.assembler_controller.on_create.bind(this.assembler_controller));
		this.children_controller?.init();
		this._texture_mesh.material = this._texture_material;
		this._texture_mesh.scale.multiplyScalar(0.25);
		this._texture_scene.add(this._texture_mesh);
		this._texture_camera.position.z = 1;

		// this ensures the builder recooks when its children are changed
		// and not just when a material that use it requests it
		this.add_post_dirty_hook('_cook_main_without_inputs_when_dirty', () => {
			setTimeout(this._cook_main_without_inputs_when_dirty_bound, 0);
		});

		this.dirty_controller.add_post_dirty_hook(
			'_reset_if_resolution_changed',
			this._reset_if_resolution_changed.bind(this)
		);
		this.params.set_post_create_params_hook(() => {
			this._reset();
		});
	}

	create_node<K extends keyof GlNodeChildrenMap>(type: K): GlNodeChildrenMap[K] {
		return super.create_node(type) as GlNodeChildrenMap[K];
	}
	children() {
		return super.children() as BaseGlNodeType[];
	}
	nodes_by_type<K extends keyof GlNodeChildrenMap>(type: K): GlNodeChildrenMap[K][] {
		return super.nodes_by_type(type) as GlNodeChildrenMap[K][];
	}

	private _cook_main_without_inputs_when_dirty_bound = this._cook_main_without_inputs_when_dirty.bind(this);
	private async _cook_main_without_inputs_when_dirty() {
		await this.cook_controller.cook_main_without_inputs();
	}

	private _reset_if_resolution_changed(trigger?: CoreGraphNode) {
		if (trigger && trigger.graph_node_id == this.p.resolution.graph_node_id) {
			this._reset();
		}
	}
	private _reset() {
		this._render_target = this._create_render_target(this.pv.resolution.x, this.pv.resolution.y);
		this._data_texture_controller?.reset();
	}

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
		if (this.assembler_controller.compile_required()) {
			this.run_assembler();
			this.assembler_controller.post_compile();
		}
	}
	private run_assembler() {
		const output_nodes = GlNodeFinder.find_output_nodes(this);
		if (output_nodes.length > 1) {
			this.states.error.set('only one output node allowed');
			return;
		}
		const output_node = output_nodes[0];
		if (output_node) {
			this.assembler_controller.assembler.set_root_nodes([output_node]);

			// main compilation
			this.assembler_controller.assembler.update_fragment_shader();

			// receives fragment and uniforms
			const fragment_shader = this.assembler_controller.assembler.fragment_shader();
			const uniforms = this.assembler_controller.assembler.uniforms();
			if (fragment_shader && uniforms) {
				this._fragment_shader = fragment_shader;
				this._uniforms = uniforms;
			}

			// TODO: remove this once the scene knows how to re-render
			// the render target if it is .uniforms_time_dependent()
			if (this.assembler_controller.assembler.uniforms_time_dependent()) {
				this.states.time_dependent.force_time_dependent();
			} else {
				this.states.time_dependent.unforce_time_dependent();
			}
		}

		if (this._fragment_shader && this._uniforms) {
			this._texture_material.fragmentShader = this._fragment_shader;
			this._texture_material.uniforms = this._uniforms;
			this._texture_material.needsUpdate = true;
			this._texture_material.uniforms.resolution = {
				value: this.pv.resolution,
			};
		}
	}

	async render_on_target() {
		if (!this._render_target) {
			return;
		}
		// keep in mind that this only works with a single renderer
		let renderer = Poly.instance().renderers_controller.first_renderer();
		if (!renderer) {
			renderer = await Poly.instance().renderers_controller.wait_for_renderer();
		}
		const prev_target = renderer.getRenderTarget();
		renderer.setRenderTarget(this._render_target);
		renderer.clear();
		renderer.render(this._texture_scene, this._texture_camera);
		renderer.setRenderTarget(prev_target);

		if (this._render_target.texture) {
			if (this.pv.use_data_texture) {
				// const w = this.pv.resolution.x;
				// const h = this.pv.resolution.y;
				// this._data_texture = this._data_texture || this._create_data_texture(w, h);
				// renderer.readRenderTargetPixels(this._render_target, 0, 0, w, h, this._data_texture.image.data);
				// this._data_texture.needsUpdate = true;
				this._data_texture_controller =
					this._data_texture_controller ||
					new DataTextureController(DataTextureControllerBufferType.Float32Array);
				const data_texture = this._data_texture_controller.from_render_target(renderer, this._render_target);
				console.log('data_texture', data_texture);

				this.set_texture(data_texture);
			} else {
				this.set_texture(this._render_target.texture);
			}
		} else {
			this.cook_controller.end_cook();
		}
	}

	render_target() {
		return this._render_target;
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
		return renderTarget;
	}
}

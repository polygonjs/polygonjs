import {TypedSopNode} from './_Base';
import {GlobalsTextureHandler} from '../gl/code/globals/Texture';

// SPECS:
// - simulation shaders should update the particles at any frame, and resimulate accordingly when at later frames
// - render material should update at any frame, without having to resimulate
// - changing the input will recompute, when on first frame only (otherwise an animated geo could make it recompute all the time)

import {InputCloneMode} from '../../poly/InputCloneMode';
import {BaseNodeType} from '../_Base';
import {BaseParamType} from '../../params/_Base';
import {NodeContext} from '../../poly/NodeContext';
import {CoreGroup} from '../../../core/geometry/Group';
import {MaterialsObjNode} from '../obj/Materials';
import {GlNodeChildrenMap} from '../../poly/registers/nodes/Gl';
import {BaseGlNodeType} from '../gl/_Base';
import {ParticlesSystemGpuRenderController} from './utils/ParticlesSystemGPU/RenderController';
import {
	ParticlesSystemGpuComputeController,
	PARTICLE_DATA_TYPES,
} from './utils/ParticlesSystemGPU/GPUComputeController';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ShaderName} from '../utils/shaders/ShaderName';
import {GlNodeFinder} from '../gl/code/utils/NodeFinder';
import {PointsBuilderMatNode} from '../mat/PointsBuilder';
import {ConstantGlNode} from '../gl/Constant';
import {AssemblerName} from '../../poly/registers/assemblers/_BaseRegister';
import {Poly} from '../../Poly';
import {ParticlesPersistedConfig} from '../gl/code/assemblers/particles/PersistedConfig';
import {ParamsInitData} from '../utils/io/IOController';

class ParticlesSystemGpuSopParamsConfig extends NodeParamsConfig {
	// gpu compute
	start_frame = ParamConfig.FLOAT(1, {range: [1, 100]});
	auto_textures_size = ParamConfig.BOOLEAN(1);
	max_textures_size = ParamConfig.VECTOR2([1024, 1024], {visible_if: {auto_textures_size: 1}});
	textures_size = ParamConfig.VECTOR2([64, 64], {visible_if: {auto_textures_size: 0}});
	data_type = ParamConfig.INTEGER(0, {
		menu: {
			entries: PARTICLE_DATA_TYPES.map((value, index) => {
				return {value: index, name: value};
			}),
		},
	});
	reset = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType, param: BaseParamType) => {
			ParticlesSystemGpuSopNode.PARAM_CALLBACK_reset(node as ParticlesSystemGpuSopNode);
		},
	});

	// render
	// this.self.within_param_folder("setup", () => {
	material = ParamConfig.OPERATOR_PATH('', {
		node_selection: {
			context: NodeContext.MAT,
		},
		dependent_on_found_node: false,
	});
}
const ParamsConfig = new ParticlesSystemGpuSopParamsConfig();
export class ParticlesSystemGpuSopNode extends TypedSopNode<ParticlesSystemGpuSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'particles_system_gpu';
	}
	get assembler_controller() {
		return this._assembler_controller;
	}
	public used_assembler(): Readonly<AssemblerName.GL_PARTICLES> {
		return AssemblerName.GL_PARTICLES;
	}
	protected _assembler_controller = this._create_assembler_controller();
	private _create_assembler_controller() {
		return Poly.instance().assemblers_register.assembler(this, this.used_assembler());
	}
	public readonly persisted_config: ParticlesPersistedConfig = new ParticlesPersistedConfig(this);
	private globals_handler = new GlobalsTextureHandler(GlobalsTextureHandler.PARTICLE_SIM_UV);
	private _shaders_by_name: Map<ShaderName, string> = new Map();
	shaders_by_name() {
		return this._shaders_by_name;
	}

	public readonly gpu_controller = new ParticlesSystemGpuComputeController(this);
	public readonly render_controller = new ParticlesSystemGpuRenderController(this);

	static require_webgl2() {
		return true;
	}
	static PARAM_CALLBACK_reset(node: ParticlesSystemGpuSopNode) {
		node.PARAM_CALLBACK_reset();
	}
	PARAM_CALLBACK_reset() {
		this.gpu_controller.reset_gpu_compute_and_set_dirty();
	}

	static displayed_input_names(): string[] {
		return ['points to emit particles from'];
	}

	private _reset_material_if_dirty_bound = this._reset_material_if_dirty.bind(this);
	protected _children_controller_context = NodeContext.GL;
	// private _on_create_prepare_material_bound = this._on_create_prepare_material.bind(this);
	initialize_node() {
		this.io.inputs.set_count(1);
		// set to never at the moment
		// otherwise the input is cloned on every frame inside cook_main()
		this.io.inputs.init_inputs_cloned_state(InputCloneMode.NEVER);

		this.add_post_dirty_hook('_reset_material_if_dirty', this._reset_material_if_dirty_bound);

		// if (this.assembler_controller) {
		// we use the method _on_create here, to link the global to the output on create,
		// as this seems to prevent a bug when the particle system is created
		// without exported textures
		// and the object fails to render until a full page reload.
		this.lifecycle.add_on_create_hook(this._on_create.bind(this));
		// this.lifecycle.add_on_create_hook(this.assembler_controller.on_create.bind(this.assembler_controller));
		// }
		// this.lifecycle.add_on_create_hook(this._on_create_prepare_material_bound);
	}

	private _on_create() {
		const current_global = this.nodes_by_type('globals')[0];
		const current_output = this.nodes_by_type('output')[0];
		if (current_global || current_output) {
			return;
		}
		const globals = this.create_node('globals');
		const output = this.create_node('output');

		output.set_input('position', globals, 'position');

		globals.ui_data.set_position(-200, 0);
		output.ui_data.set_position(200, 0);

		this._on_create_prepare_material();
	}

	create_node<K extends keyof GlNodeChildrenMap>(
		type: K,
		params_init_value_overrides?: ParamsInitData
	): GlNodeChildrenMap[K] {
		return super.create_node(type, params_init_value_overrides) as GlNodeChildrenMap[K];
	}
	children() {
		return super.children() as BaseGlNodeType[];
	}
	nodes_by_type<K extends keyof GlNodeChildrenMap>(type: K): GlNodeChildrenMap[K][] {
		return super.nodes_by_type(type) as GlNodeChildrenMap[K][];
	}
	children_allowed() {
		if (this.assembler_controller) {
			return super.children_allowed();
		}
		this.scene.mark_as_read_only(this);
		return false;
	}

	async _reset_material_if_dirty() {
		if (this.p.material.is_dirty) {
			this.render_controller.reset_render_material();
			if (!this.is_on_frame_start()) {
				await this.render_controller.init_render_material();
			}
		}
	}

	is_on_frame_start(): boolean {
		return this.scene.frame == this.pv.start_frame;
	}

	async cook(input_contents: CoreGroup[]) {
		this.gpu_controller.set_restart_not_required();
		const core_group = input_contents[0];

		this.compile_if_required();

		if (this.is_on_frame_start()) {
			this.gpu_controller.reset_particle_groups();
		}

		if (!this.gpu_controller.initialized) {
			await this.gpu_controller.init(core_group);
		}

		if (!this.render_controller.initialized) {
			this.render_controller.init_core_group(core_group);
			await this.render_controller.init_render_material();
		}

		this.gpu_controller.restart_simulation_if_required();
		this.gpu_controller.compute_similation_if_required();

		if (this.is_on_frame_start()) {
			this.set_core_group(core_group);
		} else {
			this.cook_controller.end_cook();
		}
	}
	async compile_if_required() {
		if (this.assembler_controller?.compile_required()) {
			await this.run_assembler();
		}
	}
	async run_assembler() {
		if (!this.assembler_controller) {
			return;
		}
		const export_nodes = this._find_export_nodes();
		if (export_nodes.length > 0) {
			const root_nodes = export_nodes;
			this.assembler_controller.set_assembler_globals_handler(this.globals_handler);
			this.assembler_controller.assembler.set_root_nodes(root_nodes);

			this.assembler_controller.assembler.compile();
			this.assembler_controller.post_compile();
		}

		const shaders_by_name = this.assembler_controller.assembler.shaders_by_name();
		this._set_shader_names(shaders_by_name);
	}

	private _set_shader_names(shaders_by_name: Map<ShaderName, string>) {
		this._shaders_by_name = shaders_by_name;

		this.gpu_controller.set_shaders_by_name(this._shaders_by_name);
		this.render_controller.set_shaders_by_name(this._shaders_by_name);

		this.gpu_controller.reset_gpu_compute();
		this.gpu_controller.reset_particle_groups();
	}

	init_with_persisted_config() {
		const shaders_by_name = this.persisted_config.shaders_by_name();
		const texture_allocations_controller = this.persisted_config.texture_allocations_controller();
		if (shaders_by_name && texture_allocations_controller) {
			this._set_shader_names(shaders_by_name);
			this.gpu_controller.set_persisted_texture_allocation_controller(texture_allocations_controller);
		}
	}

	private _find_export_nodes() {
		const nodes: BaseGlNodeType[] = GlNodeFinder.find_attribute_export_nodes(this);
		const output_nodes = GlNodeFinder.find_output_nodes(this);
		if (output_nodes.length > 1) {
			this.states.error.set('only one output node is allowed');
			return [];
		}
		const output_node = output_nodes[0];
		if (output_node) {
			nodes.push(output_node);
		}
		return nodes;
	}

	private _on_create_prepare_material() {
		// that's mostly to have the default shader work when creating the node
		// output.set_input('position', globals, 'position')
		// or instead we could create the default shader
		const root = this.scene.root;
		const mat_name = 'MAT';
		const particles_mat_name = 'points_particles';
		const MAT: MaterialsObjNode = root.nodes_by_type('materials')[0] || this.scene.root.create_node('materials');
		MAT.set_name(mat_name);

		const create_points_mat = (MAT: MaterialsObjNode, name: string) => {
			let points_mat = MAT.node('points_builder1') as PointsBuilderMatNode;
			if (!(points_mat && points_mat.type == PointsBuilderMatNode.type())) {
				points_mat = MAT.create_node('points_builder');
			}
			points_mat.set_name(name);

			let points_mat_constant_point_size = points_mat.node('constant') as ConstantGlNode;
			if (!(points_mat_constant_point_size && points_mat_constant_point_size.type == ConstantGlNode.type())) {
				points_mat_constant_point_size = points_mat.create_node('constant');
				points_mat_constant_point_size.set_name('constant_point_size');
			}
			points_mat_constant_point_size.p.float.set(4); // to match the default point material
			const points_mat_output1 = points_mat.node('output1');
			if (points_mat_output1) {
				points_mat_output1.set_input(
					'gl_PointSize',
					points_mat_constant_point_size,
					ConstantGlNode.OUTPUT_NAME
				);
			}
			return points_mat;
		};
		const points_mat = MAT.node(particles_mat_name) || create_points_mat(MAT, particles_mat_name);
		if (points_mat) {
			const new_path = points_mat.full_path();
			if (this.p.material.raw_input != new_path) {
				this.p.material.set(new_path);
			}
		}
	}
}

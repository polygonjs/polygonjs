import {Vector2} from 'three/src/math/Vector2';

import {TypedSopNode} from './_Base';
// import {ParamType} from 'src/Engine/Param/_Module'

// import {Lifespan} from './Concerns/ParticlesSystemGPU/Lifespan';
// import {GPUCompute} from './Concerns/ParticlesSystemGPU/GPUCompute';
// import {RenderMaterial} from './Concerns/ParticlesSystemGPU/RenderMaterial';
// import {ParticleShaderBuilder} from './Concerns/ParticlesSystemGPU/ParticleShaderBuilder'
// import {AssemblerOwner} from 'src/Engine/Node/Gl/Assembler/Owner';
import {ShaderAssemblerParticles} from 'src/engine/nodes/gl/Assembler/Particles';
import {GlobalsTextureHandler} from 'src/engine/nodes/gl/Assembler/Globals/Texture';

// SPECS:
// - simulation shaders should update the particles at any frame, and resimulate accordingly when at later frames
// - render material should update at any frame, without having to resimulate
// - changing the input will recompute, when on first frame only (otherwise an animated geo could make it recompute all the time)

// AssemblerOwner(
// 	RenderMaterial(
// 	Lifespan(
// 	GPUCompute(
import {InputCloneMode} from 'src/engine/poly/InputCloneMode';
import {BaseNodeType} from '../_Base';
import {BaseParamType} from 'src/engine/params/_Base';
import {NodeContext} from 'src/engine/poly/NodeContext';
import {CoreGroup} from 'src/core/geometry/Group';
import {GlAssemblerController} from '../gl/Assembler/Controller';
import {MaterialsObjNode} from '../obj/Materials';
import {GlNodeChildrenMap} from 'src/engine/poly/registers/Gl';
import {BaseGlNodeType} from '../gl/_Base';
import {ParticlesSystemGpuRenderController} from './utils/ParticlesSystemGPU/RenderController';
import {ParticlesSystemGpuComputeController} from './utils/ParticlesSystemGPU/GPUComputeController';

import {NodeParamsConfig, ParamConfig} from 'src/engine/nodes/utils/params/ParamsConfig';
import {ShaderName} from '../utils/shaders/ShaderName';
class ParticlesSystemGpuSopParamsConfig extends NodeParamsConfig {
	// gpu compute
	start_frame = ParamConfig.FLOAT(1, {range: [1, 100]});
	auto_textures_size = ParamConfig.BOOLEAN(1);
	max_textures_size = ParamConfig.VECTOR2([1024, 1024], {visible_if: {auto_textures_size: 1}});
	textures_size = ParamConfig.VECTOR2([64, 64], {visible_if: {auto_textures_size: 0}});
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
	protected _assembler_controller: GlAssemblerController<ShaderAssemblerParticles> = new GlAssemblerController<
		ShaderAssemblerParticles
	>(this, ShaderAssemblerParticles);
	get assembler_controller() {
		return this._assembler_controller;
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
	initialize_node() {
		// this._init_common_shader_builder(ShaderAssemblerParticles, {
		// 	has_display_flag: true,
		// 	update_on_dirty: false,
		// });

		this.io.inputs.set_count(1);
		// set to never at the moment
		// otherwise the input is cloned on every frame inside cook_main()
		this.io.inputs.init_inputs_clonable_state([InputCloneMode.NEVER]);

		this.add_post_dirty_hook(this._reset_material_if_dirty_bound);
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

	// create_params() {
	// 	// this._create_gpu_compute_params();
	// 	// this._create_render_params();
	// 	this._create_lifespan_params();
	// }

	async _reset_material_if_dirty() {
		// if(
		// 	dirty_trigger.graph_node_id &&
		// 	this._render_material_node &&
		// 	dirty_trigger.graph_node_id() == this._render_material_node.graph_node_id()
		// ){
		// 	this.remove_dirty_state()
		// } else {
		if (this.p.material.is_dirty) {
			this.render_controller.reset_render_material();
			if (!this.is_on_frame_start()) {
				await this.render_controller.init_render_material();
			}
		}
		// }
		// that seems to create an infinite loop
		// maybe only check if the type of geo has changed?
		// if(this.input_graph_node(0).is_dirty()){
		// 	this.set_compilation_required()
		// }
	}

	is_on_frame_start(): boolean {
		return this.scene.frame == this.pv.start_frame;
	}

	async cook(input_contents: CoreGroup[]) {
		const core_group = input_contents[0];
		// this._simulation_restart_required = false;
		// let set_group_required = false;
		// let points:CorePoint[] = [];

		await this.compile_if_required();
		await this.assembler_controller.assign_uniform_values();

		if (this.is_on_frame_start()) {
			this.gpu_controller.reset_particle_groups();
		}

		if (!this.gpu_controller.initialized) {
			await this.gpu_controller.init(core_group);
			// this.gpu_controller.init_particle_group_points(core_group)
			// await this.gpu_controller.create_gpu_compute();
		}

		// if (!this._gpu_compute) {
		// 	await this.gpu_controller.create_gpu_compute(points);
		// 	// set_group_required = true
		// }
		if (!this.render_controller.initialized) {
			await this.render_controller.init_core_group(core_group);
			await this.render_controller.init_render_material();
		}

		// if (this._simulation_restart_required) {
		// 	this._restart_simulation();
		// }

		this.gpu_controller.compute_similation();
		// if (frame >= this.pv.start_frame) {
		// 	if (this._last_simulated_frame == null) {
		// 		this._last_simulated_frame = this._param_start_frame - 1;
		// 	}
		// 	if (frame > this._last_simulated_frame) {
		// 		this._compute_simulation(frame - this._last_simulated_frame);
		// 	}
		// }

		if (this.is_on_frame_start()) {
			this.set_core_group(core_group);
		} else {
			this.cook_controller.end_cook();
		}
	}
	async compile_if_required() {
		if (this.assembler_controller.compile_required()) {
			// && !this._param_locked){
			await this.run_assembler();
			const shaders_by_name: Map<ShaderName, string> = this.assembler_controller.assembler.shaders_by_name();
			this.gpu_controller.set_shaders_by_name(shaders_by_name);
			this.render_controller.set_shaders_by_name(shaders_by_name);
			// if (shaders_by_name) {
			// 	await this.eval_params(this._new_params);
			// 	this._shaders_by_name = lodash_cloneDeep(shaders_by_name);
			// } else {
			// 	console.warn('no shaders by name from assembler');
			// }
			this.gpu_controller.reset_gpu_compute();
			this.gpu_controller.reset_particle_groups(); // this
		}
	}
	// shaders_by_name() {
	// 	return this._shaders_by_name;
	// }
	// shaders(): string[] {
	// 	return Object.keys(this._shaders_by_name).map((k) => this._shaders_by_name[k]);
	// }
	private async run_assembler() {
		const root_nodes = this._find_root_nodes();
		if (root_nodes.length > 0) {
			const globals_handler = new GlobalsTextureHandler(GlobalsTextureHandler.PARTICLE_SIM_UV);
			this.assembler_controller.set_assembler_globals_handler(globals_handler);
			this.assembler_controller.set_root_nodes(root_nodes);

			await this.assembler_controller.compile();
		}
	}

	private _find_root_nodes() {
		const nodes: BaseGlNodeType[] = this.assembler_controller.find_attribute_export_nodes();
		const output_node = this.assembler_controller.find_output_node();
		if (output_node) {
			nodes.push(output_node);
		}
		return nodes;
	}

	on_create() {
		// to ensure the doc can create a node to display param documentation
		// maybe there is a scene in the doc, so this isn't needed?
		// if(!this.scene()){return}

		const globals = this.create_node('globals');
		const output = this.create_node('output');

		globals.ui_data.set_position(new Vector2(-200, 0));
		output.ui_data.set_position(new Vector2(200, 0));

		// that's mostly to have the default shader work when creating the node
		// output.set_input('position', globals, 'position')
		// or instead we could create the default shader
		const root = this.scene.root;
		const mat_name = 'MAT';
		const particles_mat_name = 'points_particles';
		const MAT: MaterialsObjNode = root.nodes_by_type('materials')[0] || this.scene.root.create_node('materials');
		MAT.set_name(mat_name);

		const create_points_mat = (MAT: MaterialsObjNode, name: string) => {
			const points_mat = MAT.create_node('points')!;
			points_mat.set_name(name);

			const points_mat_constant_point_size = points_mat.create_node('constant')!;
			points_mat_constant_point_size.set_name('constant_point_size');
			points_mat_constant_point_size.p.value_float.set(4); // to match the default point material

			const points_mat_output1 = points_mat.node('output1');
			if (points_mat_output1) {
				points_mat_output1.set_input('gl_PointSize', points_mat_constant_point_size, 'value');
			}

			return points_mat;
		};
		const points_mat = MAT.node(particles_mat_name) || create_points_mat(MAT, particles_mat_name);
		if (points_mat) {
			this.p.material.set(points_mat.full_path());
		}
	}
}

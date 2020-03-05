import {TypedSopNode} from './_Base';
// import {ParamType} from '../../../Engine/Param/_Module'

// import {Lifespan} from './Concerns/ParticlesSystemGPU/Lifespan';
// import {GPUCompute} from './Concerns/ParticlesSystemGPU/GPUCompute';
// import {RenderMaterial} from './Concerns/ParticlesSystemGPU/RenderMaterial';
// import {ParticleShaderBuilder} from './Concerns/ParticlesSystemGPU/ParticleShaderBuilder'
// import {AssemblerOwner} from '../../../Engine/Node/Gl/Assembler/Owner';
import {ShaderAssemblerParticles} from '../gl/code/assemblers/particles/Particles';
import {GlobalsTextureHandler} from '../gl/code/globals/Texture';

// SPECS:
// - simulation shaders should update the particles at any frame, and resimulate accordingly when at later frames
// - render material should update at any frame, without having to resimulate
// - changing the input will recompute, when on first frame only (otherwise an animated geo could make it recompute all the time)

// AssemblerOwner(
// 	RenderMaterial(
// 	Lifespan(
// 	GPUCompute(
import {InputCloneMode} from '../../poly/InputCloneMode';
import {BaseNodeType} from '../_Base';
import {BaseParamType} from '../../params/_Base';
import {NodeContext} from '../../poly/NodeContext';
import {CoreGroup} from '../../../core/geometry/Group';
import {GlAssemblerController} from '../gl/code/Controller';
import {MaterialsObjNode} from '../obj/Materials';
import {GlNodeChildrenMap} from '../../poly/registers/Gl';
import {BaseGlNodeType} from '../gl/_Base';
import {ParticlesSystemGpuRenderController} from './utils/ParticlesSystemGPU/RenderController';
import {ParticlesSystemGpuComputeController} from './utils/ParticlesSystemGPU/GPUComputeController';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ShaderName} from '../utils/shaders/ShaderName';
import {GlNodeFinder} from '../gl/code/utils/NodeFinder';
import {PointsBuilderMatNode} from '../mat/PointsBuilder';
import {ConstantGlNode} from '../gl/Constant';
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
	protected _children_controller_context = NodeContext.GL;
	private _on_create_prepare_material_bound = this._on_create_prepare_material.bind(this);
	initialize_node() {
		// this._init_common_shader_builder(ShaderAssemblerParticles, {
		// 	has_display_flag: true,
		// 	update_on_dirty: false,
		// });

		this.io.inputs.set_count(1);
		// set to never at the moment
		// otherwise the input is cloned on every frame inside cook_main()
		this.io.inputs.init_inputs_clonable_state([InputCloneMode.NEVER]);

		this.add_post_dirty_hook('_reset_material_if_dirty', this._reset_material_if_dirty_bound);

		this.lifecycle.add_on_create_hook(this.assembler_controller.on_create.bind(this.assembler_controller));
		this.lifecycle.add_on_create_hook(this._on_create_prepare_material_bound);
		this.children_controller?.init();
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
			this.render_controller.init_core_group(core_group);
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
			this.assembler_controller.assembler.set_root_nodes(root_nodes);

			this.assembler_controller.assembler.compile();
			await this.assembler_controller.post_compile();
		}
	}

	private _find_root_nodes() {
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
	// set_compilation_required_and_dirty() {
	// 	this.assembler_controller.set_compilation_required_and_dirty();
	// }

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

import {TypedSopNode} from './_Base';
import {ShaderAssemblerParticles} from '../gl/code/assemblers/particles/Particles';
import {GlobalsTextureHandler} from '../gl/code/globals/Texture';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {NodeContext} from '../../poly/NodeContext';
import {CoreGroup} from '../../../core/geometry/Group';
import {GlAssemblerController} from '../gl/code/Controller';
import {GlNodeChildrenMap} from '../../poly/registers/nodes/Gl';
import {BaseGlNodeType} from '../gl/_Base';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {GlNodeFinder} from '../gl/code/utils/NodeFinder';
class JsPointSopParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new JsPointSopParamsConfig();
export class JsPointSopNode extends TypedSopNode<JsPointSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'js_point';
	}
	protected _assembler_controller: GlAssemblerController<ShaderAssemblerParticles> = new GlAssemblerController<
		ShaderAssemblerParticles
	>(this, ShaderAssemblerParticles);
	get assembler_controller() {
		return this._assembler_controller;
	}

	// static PARAM_CALLBACK_reset(node: ParticlesSystemGpuSopNode) {
	// 	node.PARAM_CALLBACK_reset();
	// }
	// PARAM_CALLBACK_reset() {
	// 	// this.gpu_controller.reset_gpu_compute_and_set_dirty();
	// }

	// private _reset_material_if_dirty_bound = this._reset_material_if_dirty.bind(this);
	protected _children_controller_context = NodeContext.JS;
	// private _on_create_prepare_material_bound = this._on_create_prepare_material.bind(this);
	initialize_node() {
		this.io.inputs.set_count(1);
		// set to never at the moment
		// otherwise the input is cloned on every frame inside cook_main()
		this.io.inputs.init_inputs_clonable_state([InputCloneMode.NEVER]);

		// this.add_post_dirty_hook('_reset_material_if_dirty', this._reset_material_if_dirty_bound);

		this.lifecycle.add_on_create_hook(this.assembler_controller.on_create.bind(this.assembler_controller));
		// this.lifecycle.add_on_create_hook(this._on_create_prepare_material_bound);
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

	async cook(input_contents: CoreGroup[]) {
		// this.gpu_controller.set_restart_not_required();
		const core_group = input_contents[0];

		await this.compile_if_required();

		// if (!this.render_controller.initialized) {
		// 	this.render_controller.init_core_group(core_group);
		// 	await this.render_controller.init_render_material();
		// }

		// this.gpu_controller.restart_simulation_if_required();
		// this.gpu_controller.compute_similation_if_required();

		// if (this.is_on_frame_start()) {
		// 	this.set_core_group(core_group);
		// } else {
		// 	this.cook_controller.end_cook();
		// }
		this.set_core_group(core_group);
	}
	async compile_if_required() {
		if (this.assembler_controller.compile_required()) {
			await this.run_assembler();
		}
	}
	async run_assembler() {
		const root_nodes = this._find_root_nodes();
		if (root_nodes.length > 0) {
			const globals_handler = new GlobalsTextureHandler(GlobalsTextureHandler.PARTICLE_SIM_UV);
			this.assembler_controller.set_assembler_globals_handler(globals_handler);
			this.assembler_controller.assembler.set_root_nodes(root_nodes);

			await this.assembler_controller.assembler.compile();
			await this.assembler_controller.post_compile();
		}

		// const shaders_by_name: Map<ShaderName, string> = this.assembler_controller.assembler.shaders_by_name();
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
}

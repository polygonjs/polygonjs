import {BaseNodeType} from '../_Base';
import {Poly} from '../../Poly';
import {CorePerformance} from '../../../core/performance/CorePerformance';
import {NodeCookPerformanceformanceController} from './cook/PerformanceController';
import {ContainerMap} from '../../containers/utils/ContainerMap';
import {NodeContext} from '../../poly/NodeContext';
import {ContainableMap} from '../../containers/utils/ContainableMap';
import {CoreGraphNode} from '../../../core/graph/CoreGraphNode';

export type OnCookCompleteHook = (node: BaseNodeType) => void;
export class NodeCookController<NC extends NodeContext> {
	private _core_performance: CorePerformance;
	private _cooking: boolean = false;
	private _cooking_dirty_timestamp: number | undefined;
	private _performance_controller: NodeCookPerformanceformanceController = new NodeCookPerformanceformanceController(
		this
	);

	constructor(private node: BaseNodeType) {
		this._core_performance = this.node.scene.performance;
	}
	get performance_record_started() {
		return this._core_performance.started;
	}

	// Disallowing inputs evaluation is important for switch nodes (such as SOP and COP)
	// that should not evaluate all inputs, but only a single one, depending on a param value
	// currently only for switch SOP and COP
	private _inputs_evaluation_required: boolean = true;
	disallow_inputs_evaluation() {
		this._inputs_evaluation_required = false;
	}

	get is_cooking(): boolean {
		return this._cooking === true;
	}

	private _init_cooking_state() {
		this._cooking = true;
		this._cooking_dirty_timestamp = this.node.dirty_controller.dirty_timestamp;
	}

	private _start_cook_if_no_errors(input_contents: ContainableMap[NC][]) {
		if (this.node.states.error.active) {
			this.end_cook();
		} else {
			try {
				this._performance_controller.record_cook_start();
				this.node.cook(input_contents);
			} catch (e) {
				this.node.states.error.set(`node internal error: '${e}'.`);
				console.warn(e);
				this.end_cook();
			}
		}
	}

	async cook_main() {
		// console.log(performance.now(), 'cook main start', this.node.full_path());
		if (this.is_cooking) {
			return;
		}
		this._init_cooking_state();
		this.node.states.error.clear();

		let input_contents: ContainableMap[NC][];
		if (this._inputs_evaluation_required) {
			input_contents = await this._evaluate_inputs();
		} else {
			input_contents = [];
		}
		if (this.node.params.params_eval_required()) {
			await this._evaluate_params();
		}
		this._start_cook_if_no_errors(input_contents);
		// console.log(performance.now(), 'cook main end', this.node.full_path());
	}
	async cook_main_without_inputs() {
		this.node.scene.cook_controller.add_node(this.node);
		if (this.is_cooking) {
			// TODO:
			// this seems to happen because when we flush the cooker queue,
			// some graph nodes will trigger more updates, which will then make dependent nodes
			// dirty again
			console.warn('cook_main_without_inputs already cooking', this.node.full_path());
			return;
		}
		this._init_cooking_state();
		this.node.states.error.clear();

		if (this.node.params.params_eval_required()) {
			await this._evaluate_params();
		}
		this._start_cook_if_no_errors([]);
	}

	end_cook(message?: string | null) {
		this._finalize_cook_performance();

		const dirty_timestamp = this.node.dirty_controller.dirty_timestamp;
		if (dirty_timestamp == null || dirty_timestamp === this._cooking_dirty_timestamp) {
			this.node.remove_dirty_state();
			this._terminate_cook_process();
		} else {
			Poly.instance().log('COOK AGAIN', dirty_timestamp, this._cooking_dirty_timestamp, this.node.full_path());
			this._cooking = false;
			this.cook_main();
		}
	}

	private _terminate_cook_process() {
		if (this.is_cooking) {
			this._cooking = false;
			// setTimeout(this.node.container_controller.notify_requesters.bind(this.node.container_controller), 0);
			this.node.container_controller.notify_requesters();
			this._run_on_cook_complete_hooks();
		}
	}

	private async _evaluate_inputs(): Promise<ContainableMap[NC][]> {
		this._performance_controller.record_inputs_start();

		// console.log(performance.now(), '_evaluate_inputs 0', this.node.full_path());
		let input_containers: (ContainerMap[NC] | null)[] = [];
		const io_inputs = this.node.io.inputs;
		if (this._inputs_evaluation_required) {
			if (io_inputs.is_any_input_dirty()) {
				input_containers = await io_inputs.eval_required_inputs();
			} else {
				input_containers = io_inputs.containers_without_evaluation();
			}
		}
		// console.log(performance.now(), '_evaluate_inputs 1', this.node.full_path());

		const inputs = io_inputs.inputs();
		const input_contents: ContainableMap[NC][] = [];
		// if (input_containers) {
		let input_container: ContainerMap[NC] | null;
		for (let i = 0; i < inputs.length; i++) {
			input_container = input_containers[i];
			if (input_container) {
				if (io_inputs.clone_required(i)) {
					// console.log('cloned');
					input_contents[i] = input_container.core_content_cloned() as ContainableMap[NC];
				} else {
					input_contents[i] = input_container.core_content() as ContainableMap[NC];
				}
			}
		}
		// }
		// console.log(performance.now(), '_evaluate_inputs 2', this.node.full_path());
		this._performance_controller.record_inputs_end();
		return input_contents;
	}
	private async _evaluate_params() {
		this._performance_controller.record_params_start();
		await this.node.params.eval_all();
		this._performance_controller.record_params_end();
	}

	//
	//
	// PERFORMANCE
	//
	//
	get cooks_count(): number {
		return this._performance_controller.cooks_count;
	}
	get cook_time(): number {
		return this._performance_controller.data.cook_time;
	}

	private _finalize_cook_performance() {
		if (!this._core_performance.started) {
			return;
		}
		this._performance_controller.record_cook_end();

		this._core_performance.record_node_cook_data(this.node, this._performance_controller.data);
	}

	//
	//
	// HOOK
	//
	//
	private _on_cook_complete_hook_ids: string[] | undefined;
	private _on_cook_complete_hooks: OnCookCompleteHook[] | undefined;
	add_on_cook_complete_hook(core_graph_node: CoreGraphNode, callback: OnCookCompleteHook) {
		this._on_cook_complete_hook_ids = this._on_cook_complete_hook_ids || [];
		this._on_cook_complete_hooks = this._on_cook_complete_hooks || [];
		this._on_cook_complete_hook_ids.push(core_graph_node.graph_node_id);
		this._on_cook_complete_hooks.push(callback);
	}
	remove_on_cook_complete_hook(core_graph_node: CoreGraphNode) {
		if (!this._on_cook_complete_hook_ids || !this._on_cook_complete_hooks) {
			return;
		}
		const index = this._on_cook_complete_hook_ids?.indexOf(core_graph_node.graph_node_id);
		this._on_cook_complete_hook_ids.splice(index, 1);
		this._on_cook_complete_hooks.splice(index, 1);
	}
	private _run_on_cook_complete_hooks() {
		if (this._on_cook_complete_hooks) {
			for (let hook of this._on_cook_complete_hooks) {
				hook(this.node);
			}
		}
	}
}

import {BaseNodeType} from '../_Base';
import {BaseContainer} from '../../containers/_Base';
import {Poly} from '../../Poly';
import {CorePerformance} from '../../../core/performance/CorePerformance';
import {NodeCookPerformanceformanceController} from './cook/PerformanceController';

export class NodeCookController {
	private _core_performance: CorePerformance;
	private _cooking: boolean = false;
	private _cooking_dirty_timestamp: number | undefined;
	private _performance_controller = new NodeCookPerformanceformanceController(this);

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

	private async _start_cook_if_no_errors(input_contents: any[]) {
		if (this.node.states.error.active) {
			this.end_cook();
		} else {
			try {
				this._performance_controller.record_cook_start();
				await this.node.cook(input_contents);
			} catch (e) {
				this.node.states.error.set(`node internal error: '${e}'.`);
				console.error(this.node.full_path(), e);
				this.end_cook();
			}
		}
	}

	async cook_main() {
		if (this.is_cooking) {
			return;
		}
		this._init_cooking_state();
		this.node.states.error.clear();

		const input_contents = await this._evaluate_inputs();
		await this._evaluate_params();
		await this._start_cook_if_no_errors(input_contents);
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

		await this._evaluate_params();
		await this._start_cook_if_no_errors([]);
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
			setTimeout(this.node.container_controller.notify_requesters.bind(this.node.container_controller), 0);
		}
	}

	private async _evaluate_inputs() {
		this._performance_controller.record_inputs_start();

		let input_containers: (BaseContainer | null)[] = [];
		if (this._inputs_evaluation_required) {
			input_containers = await this.node.io.inputs.eval_required_inputs();
		}

		const inputs = this.node.io.inputs.inputs();
		const input_contents = [];
		if (input_containers) {
			let input_container: BaseContainer | null;
			for (let i = 0; i < inputs.length; i++) {
				input_container = input_containers[i];
				if (input_container) {
					if (this.node.io.inputs.input_clonable_state_with_override(i)) {
						input_contents[i] = input_container.core_content_cloned();
					} else {
						input_contents[i] = input_container.core_content();
					}
				}
			}
		}
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
}

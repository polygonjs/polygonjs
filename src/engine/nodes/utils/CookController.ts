import {BaseNodeType} from '../_Base';
import {Poly} from '../../Poly';
import {CorePerformance} from '../../../core/performance/CorePerformance';
import {NodeCookPerformanceformanceController} from './cook/PerformanceController';
import {ContainerMap} from '../../containers/utils/ContainerMap';
import {NodeContext} from '../../poly/NodeContext';
import {ContainableMap} from '../../containers/utils/ContainableMap';

export type OnCookCompleteHook = () => void;
export class NodeCookController<NC extends NodeContext> {
	private _core_performance: CorePerformance;
	private _cooking: boolean = false;
	private _cooking_dirty_timestamp: number | undefined;
	private _performanceController: NodeCookPerformanceformanceController = new NodeCookPerformanceformanceController(
		this
	);

	constructor(private node: BaseNodeType) {
		this._core_performance = this.node.scene().performance;
	}
	performanceRecordStarted() {
		return this._core_performance.started();
	}
	dispose() {
		this._clearHooks();
	}

	// Disallowing inputs evaluation is important for switch nodes (such as SOP and COP)
	// that should not evaluate all inputs, but only a single one, depending on a param value
	// currently only for switch SOP and COP
	private _inputs_evaluation_required: boolean = true;
	disallowInputsEvaluation() {
		this._inputs_evaluation_required = false;
	}

	isCooking(): boolean {
		return this._cooking === true;
	}

	private _start_cook_if_no_errors(input_contents: ContainableMap[NC][]) {
		if (this.node.states.error.active()) {
			this.endCook();
		} else {
			try {
				this._performanceController.recordCookStart();
				this.node.cook(input_contents);
			} catch (e) {
				this.node.states.error.set(`node internal error: '${e}'.`);
				Poly.warn(e);
				this.endCook();
			}
		}
	}

	async cookMain() {
		if (this.isCooking()) {
			return;
		}
		this._initCookingState();
		this.node.states.error.clear();
		this.node.scene().cookController.addNode(this.node);

		let input_contents: ContainableMap[NC][];
		if (this._inputs_evaluation_required) {
			input_contents = await this._evaluateInputs();
		} else {
			input_contents = [];
		}
		if (this.node.params.paramsEvalRequired()) {
			await this._evaluateParams();
		}
		this._start_cook_if_no_errors(input_contents);
	}
	async cookMainWithoutInputs() {
		this.node.scene().cookController.addNode(this.node);
		if (this.isCooking()) {
			// TODO:
			// this seems to happen because when we flush the cooker queue,
			// some graph nodes will trigger more updates, which will then make dependent nodes
			// dirty again
			Poly.warn('cook_main_without_inputs already cooking', this.node.path());
			return;
		}
		this._initCookingState();
		this.node.states.error.clear();

		if (this.node.params.paramsEvalRequired()) {
			await this._evaluateParams();
		}
		this._start_cook_if_no_errors([]);
	}

	endCook(message?: string | null) {
		this._finalizeCookPerformance();

		const dirtyTimestamp = this.node.dirtyController.dirtyTimestamp();
		if (dirtyTimestamp == null || dirtyTimestamp === this._cooking_dirty_timestamp) {
			this.node.removeDirtyState();
			this._terminateCookProcess();
		} else {
			if (this.node.flags?.bypass?.active()) {
				return;
			}
			Poly.log('COOK AGAIN', dirtyTimestamp, this._cooking_dirty_timestamp, this.node.path());
			this._cooking = false;
			this.cookMain();
		}
	}
	private _initCookingState() {
		this._cooking = true;
		this._cooking_dirty_timestamp = this.node.dirtyController.dirtyTimestamp();
	}
	private _terminateCookProcess() {
		if (this.isCooking()) {
			this._cooking = false;
			// setTimeout(this.node.containerController.notifyRequesters.bind(this.node.containerController), 0);
			this.node.containerController.notifyRequesters();
			this._run_on_cook_complete_hooks();
		}
	}

	private async _evaluateInputs(): Promise<ContainableMap[NC][]> {
		this._performanceController.recordInputsStart();

		let input_containers: (ContainerMap[NC] | null)[] = [];
		const io_inputs = this.node.io.inputs;
		if (this._inputs_evaluation_required) {
			if (io_inputs.is_any_input_dirty()) {
				input_containers = await io_inputs.evalRequiredInputs();
			} else {
				input_containers = await io_inputs.containers_without_evaluation();
			}
		}

		const inputs = io_inputs.inputs();
		const input_contents: ContainableMap[NC][] = [];
		let input_container: ContainerMap[NC] | null;
		for (let i = 0; i < inputs.length; i++) {
			input_container = input_containers[i];
			if (input_container) {
				if (io_inputs.cloneRequired(i)) {
					input_contents[i] = input_container.coreContentCloned() as ContainableMap[NC];
				} else {
					input_contents[i] = input_container.coreContent() as ContainableMap[NC];
				}
			}
		}
		this._performanceController.recordInputsEnd();
		return input_contents;
	}
	private async _evaluateParams() {
		this._performanceController.recordParamsStart();
		await this.node.params.evalAll();
		this._performanceController.recordParamsEnd();
	}

	//
	//
	// PERFORMANCE
	//
	//
	cooksCount(): number {
		return this._performanceController.cooksCount();
	}
	cookTime(): number {
		return this._performanceController.data2().cookTime;
	}

	private _finalizeCookPerformance() {
		if (!this._core_performance.started()) {
			return;
		}
		this._performanceController.recordCookEnd();

		this._core_performance.record_node_cook_data(this.node, this._performanceController.data2());
	}

	//
	//
	// HOOK
	//
	//
	private _on_cook_complete_hook_names: string[] | undefined;
	private _on_cook_complete_hooks: OnCookCompleteHook[] | undefined;
	registerOnCookEnd(callbackName: string, callback: OnCookCompleteHook) {
		this._on_cook_complete_hook_names = this._on_cook_complete_hook_names || [];
		this._on_cook_complete_hooks = this._on_cook_complete_hooks || [];
		this._on_cook_complete_hook_names.push(callbackName);
		this._on_cook_complete_hooks.push(callback);
	}
	private _clearHooks() {
		if (!this._on_cook_complete_hook_names || !this._on_cook_complete_hooks) {
			return;
		}
		for (let hookName of this._on_cook_complete_hook_names) {
			this.deregisterOnCookEnd(hookName);
		}
	}
	deregisterOnCookEnd(callbackName: string) {
		if (!this._on_cook_complete_hook_names || !this._on_cook_complete_hooks) {
			return;
		}
		const index = this._on_cook_complete_hook_names?.indexOf(callbackName);
		this._on_cook_complete_hook_names.splice(index, 1);
		this._on_cook_complete_hooks.splice(index, 1);
		if (this._on_cook_complete_hook_names.length == 0) {
			this._on_cook_complete_hook_names = undefined;
		}
		if (this._on_cook_complete_hooks.length == 0) {
			this._on_cook_complete_hooks = undefined;
		}
	}
	private _run_on_cook_complete_hooks() {
		if (this._on_cook_complete_hooks) {
			for (let hook of this._on_cook_complete_hooks) {
				hook();
			}
		}
	}
	onCookEndCallbackNames() {
		return this._on_cook_complete_hook_names;
	}
}

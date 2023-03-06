import {BaseNodeType} from '../_Base';
import {Poly} from '../../Poly';
import {CorePerformance} from '../../../core/performance/CorePerformance';
import {NodeCookPerformanceformanceController} from './cook/PerformanceController';
import {ContainerMap} from '../../containers/utils/ContainerMap';
import {NodeContext} from '../../poly/NodeContext';
import {ContainableMap} from '../../containers/utils/ContainableMap';

export type OnCookCompleteHook = () => void;
export class NodeCookController<NC extends NodeContext> {
	private _corePerformance: CorePerformance;
	private _cooking: boolean = false;
	private _cookingDirtyTimestamp: number | undefined;
	private _performanceController: NodeCookPerformanceformanceController = new NodeCookPerformanceformanceController(
		this
	);

	constructor(private node: BaseNodeType) {
		this._corePerformance = this.node.scene().performance;
	}
	performanceRecordStarted() {
		return this._corePerformance.started();
	}
	dispose() {
		this._clearHooks();
	}

	// Disallowing inputs evaluation is important for switch nodes (such as SOP and COP)
	// that should not evaluate all inputs, but only a single one, depending on a param value
	// currently only for switch SOP and COP
	private _inputsEvaluationRequired: boolean = true;
	disallowInputsEvaluation() {
		this._inputsEvaluationRequired = false;
	}

	isCooking(): boolean {
		return this._cooking === true;
	}

	private _startCookIfNoErrors(inputContents?: ContainableMap[NC][]) {
		if (this.node.states.error.active()) {
			this.endCook();
		} else {
			try {
				this._performanceController.recordCookStart();
				// make sure we treat rejected promise
				// if cook is async
				const promise = this.node.cook(inputContents || []);
				if (promise != null) {
					promise.catch((e: any) => {
						if (!this.node.states.error.active()) {
							this.node.states.error.set(`node inputs error: '${e}'.`);
							Poly.warn(e);
						}
						this.endCook();
					});
				}
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

		try {
			// we need to try/catch inputs fetching,
			// as some nodes like the sop/normalsHelper
			// currently fail when being cloned
			const inputContents: ContainableMap[NC][] | undefined = this._inputsEvaluationRequired
				? await this._evaluateInputs()
				: undefined;
			if (this.node.params.paramsEvalRequired()) {
				await this._evaluateParams();
			}
			this._startCookIfNoErrors(inputContents);
		} catch (e) {
			this.node.states.error.set(`node inputs error: '${e}'.`);
			Poly.warn(e);
			this.endCook();
		}
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
		this._startCookIfNoErrors(undefined);
	}

	endCook(/*message?: string | null*/) {
		this._finalizeCookPerformance();

		const dirtyTimestamp = this.node.dirtyController.dirtyTimestamp();
		const timestampUnchangedSinceCookStarted =
			dirtyTimestamp == null || dirtyTimestamp === this._cookingDirtyTimestamp;
		if (
			timestampUnchangedSinceCookStarted ||
			this.node.flags?.bypass?.active() /* || this._scenePlayingAndNodeAlreadyCookedForCurrentFrame()*/
		) {
			this.node.removeDirtyState();
			this._terminateCookProcess();
		} else {
			// if (this.node.flags?.bypass?.active()) {
			// 	return;
			// }
			Poly.log('COOK AGAIN', dirtyTimestamp, this._cookingDirtyTimestamp, this.node.path());
			this._cooking = false;
			this.cookMain();
		}
	}
	// private _lastFrameCooked: number | undefined;
	// private _scenePlayingAndNodeAlreadyCookedForCurrentFrame() {
	// 	if (this.node.scene().timeController.playing()) {
	// 		return this._lastFrameCooked == this.node.scene().frame();
	// 	}
	// 	return false;
	// }
	private _initCookingState() {
		this._cooking = true;
		// this._lastFrameCooked = this.node.scene().frame();
		this._cookingDirtyTimestamp = this.node.dirtyController.dirtyTimestamp();
	}
	private _terminateCookProcess() {
		if (this.isCooking() || this.node.flags?.bypass?.active()) {
			this._cooking = false;

			// setTimeout(this.node.containerController.notifyRequesters.bind(this.node.containerController), 0);
			this.node.containerController.notifyRequesters();
			this._runOnCookCompleteHooks();
		}
	}

	private async _evaluateInputs(): Promise<ContainableMap[NC][]> {
		this._performanceController.recordInputsStart();

		const ioOnputs = this.node.io.inputs;

		const inputContainers: (ContainerMap[NC] | null)[] = this._inputsEvaluationRequired
			? ioOnputs.isGraphNodeDirty()
				? await ioOnputs.evalRequiredInputs()
				: ioOnputs.containersWithoutEvaluation()
			: [];

		const inputs = ioOnputs.inputs();
		const inputContents: ContainableMap[NC][] = [];
		let inputContainer: ContainerMap[NC] | null;
		for (let i = 0; i < inputs.length; i++) {
			inputContainer = inputContainers[i];
			if (inputContainer) {
				if (ioOnputs.cloneRequired(i)) {
					inputContents[i] = inputContainer.coreContentCloned() as ContainableMap[NC];
				} else {
					inputContents[i] = inputContainer.coreContent() as ContainableMap[NC];
				}
			}
		}
		this._performanceController.recordInputsEnd();
		return inputContents;
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
		return this._performanceController.data().cookTime;
	}

	private _finalizeCookPerformance() {
		if (!this._corePerformance.started()) {
			return;
		}
		this._performanceController.recordCookEnd();

		this._corePerformance.recordNodeCookData(this.node, this._performanceController.data());
	}

	//
	//
	// HOOK
	//
	//
	private _onCookCompleteHookNames: string[] | undefined;
	private _onCookCompleteHooks: OnCookCompleteHook[] | undefined;
	registerOnCookEnd(callbackName: string, callback: OnCookCompleteHook) {
		this._onCookCompleteHookNames = this._onCookCompleteHookNames || [];
		this._onCookCompleteHooks = this._onCookCompleteHooks || [];
		this._onCookCompleteHookNames.push(callbackName);
		this._onCookCompleteHooks.push(callback);
	}
	private _clearHooks() {
		if (!this._onCookCompleteHookNames || !this._onCookCompleteHooks) {
			return;
		}
		for (let hookName of this._onCookCompleteHookNames) {
			this.deregisterOnCookEnd(hookName);
		}
	}
	deregisterOnCookEnd(callbackName: string) {
		if (!this._onCookCompleteHookNames || !this._onCookCompleteHooks) {
			return;
		}
		const index = this._onCookCompleteHookNames?.indexOf(callbackName);
		this._onCookCompleteHookNames.splice(index, 1);
		this._onCookCompleteHooks.splice(index, 1);
		if (this._onCookCompleteHookNames.length == 0) {
			this._onCookCompleteHookNames = undefined;
		}
		if (this._onCookCompleteHooks.length == 0) {
			this._onCookCompleteHooks = undefined;
		}
	}
	private _runOnCookCompleteHooks() {
		if (this._onCookCompleteHooks) {
			const hooks = [...this._onCookCompleteHooks];
			for (let hook of hooks) {
				hook();
			}
		}
	}
	onCookEndCallbackNames() {
		return this._onCookCompleteHookNames;
	}
}

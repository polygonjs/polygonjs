import {ClonedStatesController} from './inputs/ClonedStatesController';
import {InputCloneMode} from '../../../../engine/poly/InputCloneMode';
import {BaseOperationContainer} from '../_Base';
import {NodeContext} from '../../../poly/NodeContext';

export class InputsController<NC extends NodeContext> {
	constructor(private operationContainer: BaseOperationContainer<NC>) {}
	inputsCount() {
		return this.operationContainer.inputsCount();
	}

	//
	//
	// CLONABLE STATES
	//
	//
	private _clonedStatesController: ClonedStatesController<NC> | undefined;
	initInputsClonedState(states: InputCloneMode | InputCloneMode[]) {
		if (!this._clonedStatesController) {
			this._clonedStatesController = new ClonedStatesController(this);
			this._clonedStatesController.initInputsClonedState(states);
		}
	}

	cloneRequired(index: number) {
		const state = this._clonedStatesController?.clone_required_state(index);
		if (state != null) {
			return state;
		}
		return true;
	}
	override_cloned_state(state: boolean) {
		this._clonedStatesController?.override_cloned_state(state);
	}
}

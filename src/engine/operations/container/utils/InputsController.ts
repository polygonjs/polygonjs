import {ClonedStatesController} from './inputs/ClonedStatesController';
import {InputCloneMode} from '../../../../engine/poly/InputCloneMode';
import {BaseOperationContainer} from '../_Base';
import {NodeContext} from '../../../poly/NodeContext';

export class InputsController<NC extends NodeContext> {
	constructor(private operation_container: BaseOperationContainer<NC>) {}
	inputs_count() {
		return this.operation_container.inputs_count();
	}

	//
	//
	// CLONABLE STATES
	//
	//
	private _cloned_states_controller: ClonedStatesController<NC> | undefined;
	init_inputs_cloned_state(states: InputCloneMode | InputCloneMode[]) {
		if (!this._cloned_states_controller) {
			this._cloned_states_controller = new ClonedStatesController(this);
			this._cloned_states_controller.init_inputs_cloned_state(states);
		}
	}

	clone_required(index: number) {
		const state = this._cloned_states_controller?.clone_required_state(index);
		if (state != null) {
			return state;
		}
		return true;
	}
	override_cloned_state(state: boolean) {
		this._cloned_states_controller?.override_cloned_state(state);
	}
}

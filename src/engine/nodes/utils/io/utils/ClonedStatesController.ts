import {NodeContext} from '../../../../poly/NodeContext';
import {InputCloneMode} from '../../../../poly/InputCloneMode';
import {InputsController} from '../InputsController';
import {TypeAssert} from '../../../../poly/Assert';
import {NodeEvent} from '../../../../poly/NodeEvent';
import {TypedNode} from '../../../_Base';
import {CoreType} from '../../../../../core/Type';

export class ClonedStatesController<NC extends NodeContext> {
	// private _user_inputs_clonable_states: InputCloneMode[] | undefined;
	private _clonedStates: InputCloneMode[] | undefined;
	private _clonedState: InputCloneMode | undefined;
	private _cloneRequiredStates: boolean[] = [];
	// private _cloneRequiredStatesMap: Map<number, boolean> = new Map();
	private _overridden: boolean = false;

	private node: TypedNode<NC, any>;
	constructor(private inputs_controller: InputsController<NC>) {
		this.node = inputs_controller.node;
	}
	initInputsClonedState(states: InputCloneMode | InputCloneMode[]) {
		// if (values) {
		// 	this._user_inputs_clonable_states = values;
		// }
		if (CoreType.isArray(states)) {
			this._clonedStates = states; //this._user_inputs_clonable_states || this._default_inputs_clonale_state_values();
		} else {
			this._clonedState = states;
		}

		this._updateCloneRequiredState();
	}

	overrideClonedStateAllowed() {
		if (this._clonedStates) {
			for (let state of this._clonedStates) {
				if (state == InputCloneMode.FROM_NODE) {
					return true;
				}
			}
		}
		if (this._clonedState) {
			return this._clonedState == InputCloneMode.FROM_NODE;
		}
		return false;
	}

	// private get inputs_clonable_state(): InputCloneMode[] {
	// 	return (this._inputs_clonable_states = this._inputs_clonable_states || this.init_inputs_clonable_state());
	// }
	cloneRequiredState(index: number): boolean | undefined {
		const result = this._cloneRequiredStates[index]; //this._cloneRequiredStatesMap.get(index);
		// TODO: rework this and test with sop/merge
		// if (result == null) {
		// 	// If we do not have a value for index,
		// 	// we can use the last of the array.
		// 	// This is useful for sop/merge
		// 	console.log(this._cloneRequiredStates, this._cloneRequiredStates[this._cloneRequiredStates.length - 1]);
		// 	return this._cloneRequiredStates[this._cloneRequiredStates.length - 1];
		// }
		return result;
	}
	cloneRequiredStates(): boolean[] {
		return this._cloneRequiredStates;
	}
	// inputs_clonable_state_with_override(): boolean[] {
	// 	// const list = [];
	// 	// const states = this.inputs_clonable_state();
	// 	// for (let i = 0; i < states.length; i++) {
	// 	// 	list.push(this.input_clonable_state_with_override(i));
	// 	// }
	// 	// return list;
	// 	return this._inputs_cloned_state;
	// }
	private _getCloneRequiredState(index: number): boolean {
		const states = this._clonedStates;
		if (states) {
			const state = states[index];
			if (state != null) {
				return this._cloneRequiredFromState(state);
			}
		}
		if (this._clonedState) {
			return this._cloneRequiredFromState(this._clonedState);
		}
		return true;
	}
	private _cloneRequiredFromState(state: InputCloneMode) {
		switch (state) {
			case InputCloneMode.ALWAYS:
				return true;
			case InputCloneMode.NEVER:
				return false;
			case InputCloneMode.FROM_NODE:
				return !this._overridden;
		}
		return TypeAssert.unreachable(state);
	}

	// private _default_inputs_clonale_state_values() {
	// 	const list = [];
	// 	for (let i = 0; i < this.inputs_controller.max_inputs_count; i++) {
	// 		list.push(InputCloneMode.ALWAYS);
	// 	}
	// 	return list;
	// }

	overrideClonedState(state: boolean) {
		this._overridden = state;
		this._updateCloneRequiredState();
		this.node.emit(NodeEvent.OVERRIDE_CLONABLE_STATE_UPDATE);
		this.node.setDirty();
	}
	overriden() {
		return this._overridden;
	}
	private _updateCloneRequiredState() {
		if (this._clonedStates) {
			const states: boolean[] = [];
			for (let i = 0; i < this._clonedStates.length; i++) {
				states[i] = this._getCloneRequiredState(i);
			}
			this._cloneRequiredStates = states;
		} else {
			if (this._clonedState) {
				const max_inputs = this.inputs_controller.maxInputsCount();
				const states: boolean[] = [];
				for (let i = 0; i < max_inputs; i++) {
					states[i] = this._getCloneRequiredState(i);
				}
				this._cloneRequiredStates = states;
			}
		}
		// update map
		// this._cloneRequiredStatesMap.clear();
		// if (this._cloneRequiredStates) {
		// 	for (let i = 0; i < this._cloneRequiredStates.length; i++) {
		// 		this._cloneRequiredStatesMap.set(i, this._cloneRequiredStates[i]);
		// 	}
		// }
	}
}

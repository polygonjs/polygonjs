import {NodeContext} from '../../../../poly/NodeContext';
import {InputCloneMode} from '../../../../poly/InputCloneMode';
import {InputsController} from '../InputsController';
import {TypeAssert} from '../../../../poly/Assert';
import {NodeEvent} from '../../../../poly/NodeEvent';
import {TypedNode} from '../../../_Base';
import lodash_isArray from 'lodash/isArray';

export class ClonedStatesController<NC extends NodeContext> {
	// private _user_inputs_clonable_states: InputCloneMode[] | undefined;
	private _cloned_states: InputCloneMode[] | undefined;
	private _cloned_state: InputCloneMode | undefined;
	private _clone_required_states: boolean[] = [];
	private _overridden: boolean = false;

	private node: TypedNode<NC, any>;
	constructor(private inputs_controller: InputsController<NC>) {
		this.node = inputs_controller.node;
	}
	init_inputs_cloned_state(states: InputCloneMode | InputCloneMode[]) {
		// if (values) {
		// 	this._user_inputs_clonable_states = values;
		// }
		if (lodash_isArray(states)) {
			this._cloned_states = states; //this._user_inputs_clonable_states || this._default_inputs_clonale_state_values();
		} else {
			this._cloned_state = states;
		}

		this._update_clone_required_state();
	}

	override_cloned_state_allowed() {
		if (this._cloned_states) {
			for (let state of this._cloned_states) {
				if (state == InputCloneMode.FROM_NODE) {
					return true;
				}
			}
		}
		if (this._cloned_state) {
			return this._cloned_state == InputCloneMode.FROM_NODE;
		}
		return false;
	}

	// private get inputs_clonable_state(): InputCloneMode[] {
	// 	return (this._inputs_clonable_states = this._inputs_clonable_states || this.init_inputs_clonable_state());
	// }
	clone_required_state(index: number): boolean {
		return this._clone_required_states[index];
	}
	clone_required_states(): boolean | boolean[] {
		return this._clone_required_states;
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
	private _get_clone_required_state(index: number): boolean {
		const states = this._cloned_states;
		if (states) {
			const state = states[index];
			if (state != null) {
				return this.clone_required_from_state(state);
			}
		}
		if (this._cloned_state) {
			return this.clone_required_from_state(this._cloned_state);
		}
		return true;
	}
	private clone_required_from_state(state: InputCloneMode) {
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

	override_cloned_state(state: boolean) {
		this._overridden = state;
		this._update_clone_required_state();
		this.node.emit(NodeEvent.OVERRIDE_CLONABLE_STATE_UPDATE);
		this.node.set_dirty();
	}
	overriden() {
		return this._overridden;
	}
	private _update_clone_required_state() {
		if (this._cloned_states) {
			const states: boolean[] = [];
			for (let i = 0; i < this._cloned_states.length; i++) {
				states[i] = this._get_clone_required_state(i);
			}
			this._clone_required_states = states;
			return;
		}
		if (this._cloned_state) {
			const max_inputs = this.inputs_controller.max_inputs_count;
			const states: boolean[] = [];
			for (let i = 0; i < max_inputs; i++) {
				states[i] = this._get_clone_required_state(i);
			}
			this._clone_required_states = states;
			return;
		}
	}
}

import {InputsController} from '../InputsController';
import {InputCloneMode} from '../../../../../engine/poly/InputCloneMode';
import {TypeAssert} from '../../../../../engine/poly/Assert';
import lodash_isArray from 'lodash/isArray';
// import {TypeAssert} from '../../../../../engine/poly/Assert';

export class ClonedStatesController {
	private _cloned_states: InputCloneMode[] | undefined;
	private _cloned_state: InputCloneMode | undefined;
	private _clone_required_states: boolean[] = [];
	private _overridden: boolean = false;

	constructor(protected inputs_controller: InputsController) {}
	init_inputs_cloned_state(states: InputCloneMode | InputCloneMode[]) {
		if (lodash_isArray(states)) {
			this._cloned_states = states;
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

	clone_required_state(index: number): boolean {
		return this._clone_required_states[index];
	}
	clone_required_states(): boolean | boolean[] {
		return this._clone_required_states;
	}

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

	override_cloned_state(state: boolean) {
		this._overridden = state;
		this._update_clone_required_state();
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
			const max_inputs = this.inputs_controller.inputs_count();
			const states: boolean[] = [];
			for (let i = 0; i < max_inputs; i++) {
				states[i] = this._get_clone_required_state(i);
			}
			this._clone_required_states = states;
			return;
		}
	}
}

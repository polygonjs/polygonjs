import {InputCloneMode as InputCloneMode2} from "../../../../../engine/poly/InputCloneMode";
import {TypeAssert} from "../../../../../engine/poly/Assert";
import lodash_isArray from "lodash/isArray";
export class ClonedStatesController {
  constructor(inputs_controller) {
    this.inputs_controller = inputs_controller;
    this._clone_required_states = [];
    this._overridden = false;
  }
  init_inputs_cloned_state(states) {
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
        if (state == InputCloneMode2.FROM_NODE) {
          return true;
        }
      }
    }
    if (this._cloned_state) {
      return this._cloned_state == InputCloneMode2.FROM_NODE;
    }
    return false;
  }
  clone_required_state(index) {
    return this._clone_required_states[index];
  }
  clone_required_states() {
    return this._clone_required_states;
  }
  _get_clone_required_state(index) {
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
  clone_required_from_state(state) {
    switch (state) {
      case InputCloneMode2.ALWAYS:
        return true;
      case InputCloneMode2.NEVER:
        return false;
      case InputCloneMode2.FROM_NODE:
        return !this._overridden;
    }
    return TypeAssert.unreachable(state);
  }
  override_cloned_state(state) {
    this._overridden = state;
    this._update_clone_required_state();
  }
  overriden() {
    return this._overridden;
  }
  _update_clone_required_state() {
    if (this._cloned_states) {
      const states = [];
      for (let i = 0; i < this._cloned_states.length; i++) {
        states[i] = this._get_clone_required_state(i);
      }
      this._clone_required_states = states;
      return;
    }
    if (this._cloned_state) {
      const max_inputs = this.inputs_controller.inputs_count();
      const states = [];
      for (let i = 0; i < max_inputs; i++) {
        states[i] = this._get_clone_required_state(i);
      }
      this._clone_required_states = states;
      return;
    }
  }
}

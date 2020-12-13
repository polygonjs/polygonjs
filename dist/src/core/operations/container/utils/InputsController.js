import {ClonedStatesController as ClonedStatesController2} from "./inputs/ClonedStatesController";
export class InputsController {
  constructor(operation_container) {
    this.operation_container = operation_container;
  }
  inputs_count() {
    return this.operation_container.inputs_count();
  }
  init_inputs_cloned_state(states) {
    if (!this._cloned_states_controller) {
      this._cloned_states_controller = new ClonedStatesController2(this);
      this._cloned_states_controller.init_inputs_cloned_state(states);
    }
  }
  clone_required(index) {
    const state = this._cloned_states_controller?.clone_required_state(index);
    if (state != null) {
      return state;
    }
    return true;
  }
  override_cloned_state(state) {
    this._cloned_states_controller?.override_cloned_state(state);
  }
}

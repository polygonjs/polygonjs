import {BaseOperationContainer} from "./_Base";
export class SopOperationContainer extends BaseOperationContainer {
  constructor(operation, name, init_params) {
    super(operation, name, init_params);
    this.operation = operation;
    this.name = name;
    this.init_params = init_params;
    this._inputs = [];
    this._current_input_index = 0;
    this._dirty = true;
  }
  add_input(input) {
    super.set_input(this._current_input_index, input);
    this.increment_input_index();
  }
  increment_input_index() {
    this._current_input_index++;
  }
  current_input_index() {
    return this._current_input_index;
  }
  set_dirty() {
    if (this._dirty) {
      return;
    }
    this._compute_result = void 0;
    for (let i = 0; i < this._inputs.length; i++) {
      const input_operation = this._inputs[i];
      input_operation.set_dirty();
    }
  }
  async compute(input_contents, operation_inputs_map) {
    if (this._compute_result) {
      return this._compute_result;
    }
    const operation_input_contents = [];
    const node_inputs_map = operation_inputs_map.get(this);
    if (node_inputs_map) {
      node_inputs_map.forEach((node_input_index, operation_input_index) => {
        operation_input_contents[operation_input_index] = input_contents[node_input_index];
      });
    }
    for (let i = 0; i < this._inputs.length; i++) {
      const input_operation = this._inputs[i];
      let result2 = await input_operation.compute(input_contents, operation_inputs_map);
      if (result2) {
        if (this.input_clone_required(i)) {
          result2 = result2.clone();
        }
        operation_input_contents[i] = result2;
      }
    }
    const result = this.operation.cook(operation_input_contents, this.params);
    if (result) {
      if (result instanceof Promise) {
        this._compute_result = await result;
      } else {
        this._compute_result = result;
      }
    } else {
      this._compute_result = void 0;
    }
    this._dirty = false;
    return this._compute_result;
  }
}

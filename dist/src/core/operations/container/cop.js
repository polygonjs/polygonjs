import {BaseOperation} from "../_Base";
import {BaseOperationContainer} from "./_Base";
import {NodeContext as NodeContext2} from "../../../engine/poly/NodeContext";
export class BaseCopOperation extends BaseOperation {
  static context() {
    return NodeContext2.COP;
  }
  cook(input_contents, params) {
  }
}
export class CopOperationContainer extends BaseOperationContainer {
  constructor(operation, name, init_params) {
    super(operation, name, init_params);
    this.operation = operation;
    this.name = name;
    this.init_params = init_params;
    this._inputs = [];
    this._current_input_index = 0;
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
  async compute(input_contents, operation_inputs_map) {
    const operation_input_contents = [];
    const node_inputs_map = operation_inputs_map.get(this);
    if (node_inputs_map) {
      node_inputs_map.forEach((node_input_index, operation_input_index) => {
        operation_input_contents[operation_input_index] = input_contents[node_input_index];
      });
    }
    for (let i = 0; i < this._inputs.length; i++) {
      const input_operation = this._inputs[i];
      const result = await input_operation.compute(input_contents, operation_inputs_map);
      if (result) {
        operation_input_contents[i] = result;
      }
    }
    return this.operation.cook(operation_input_contents, this.params);
  }
}

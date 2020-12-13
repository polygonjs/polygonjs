import {TypedSopNode} from "./_Base";
import {OPERATIONS_COMPOSER_NODE_TYPE} from "../../../core/operations/_Base";
import {InputCloneMode as InputCloneMode2} from "../../poly/InputCloneMode";
import {NodeParamsConfig} from "../utils/params/ParamsConfig";
class OperationsComposerSopParamConfig extends NodeParamsConfig {
}
const ParamsConfig2 = new OperationsComposerSopParamConfig();
export class OperationsComposerSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this._input_configs_by_operation_container = new WeakMap();
  }
  static type() {
    return OPERATIONS_COMPOSER_NODE_TYPE;
  }
  initialize_node() {
    this.io.inputs.init_inputs_cloned_state(InputCloneMode2.FROM_NODE);
  }
  set_output_operation_container(operation_container) {
    this._output_operation_container = operation_container;
  }
  output_operation_container() {
    return this._output_operation_container;
  }
  add_input_config(operation, input_config) {
    let existing_map = this._input_configs_by_operation_container.get(operation);
    if (!existing_map) {
      existing_map = new Map();
      this._input_configs_by_operation_container.set(operation, existing_map);
    }
    existing_map.set(input_config.operation_input_index, input_config.node_input_index);
  }
  add_operation_container_with_path_param_resolve_required(operation_container) {
    if (!this._operation_containers_requiring_resolve) {
      this._operation_containers_requiring_resolve = [];
    }
    this._operation_containers_requiring_resolve.push(operation_container);
  }
  resolve_operation_containers_path_params() {
    if (!this._operation_containers_requiring_resolve) {
      return;
    }
    for (let operation_container of this._operation_containers_requiring_resolve) {
      operation_container.resolve_path_params(this);
    }
  }
  async cook(input_contents) {
    if (this._output_operation_container) {
      this._output_operation_container.set_dirty();
      const core_group = await this._output_operation_container.compute(input_contents, this._input_configs_by_operation_container);
      if (core_group) {
        this.set_core_group(core_group);
      }
    }
  }
}

import {TypedSopNode} from "./_Base";
import {InputCloneMode as InputCloneMode2} from "../../poly/InputCloneMode";
import {NodeContext as NodeContext2} from "../../poly/NodeContext";
import {NodeParamsConfig} from "../utils/params/ParamsConfig";
class JsPointSopParamsConfig extends NodeParamsConfig {
}
const ParamsConfig2 = new JsPointSopParamsConfig();
export class JsPointSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this._children_controller_context = NodeContext2.JS;
  }
  static type() {
    return "js_point";
  }
  initialize_node() {
    this.io.inputs.set_count(1);
    this.io.inputs.init_inputs_cloned_state(InputCloneMode2.NEVER);
  }
  createNode(node_class, params_init_value_overrides) {
    return super.createNode(node_class, params_init_value_overrides);
  }
  children() {
    return super.children();
  }
  nodes_by_type(type) {
    return super.nodes_by_type(type);
  }
  async cook(input_contents) {
    const core_group = input_contents[0];
    this.compile_if_required();
    this.set_core_group(core_group);
  }
  async compile_if_required() {
  }
  async run_assembler() {
  }
}

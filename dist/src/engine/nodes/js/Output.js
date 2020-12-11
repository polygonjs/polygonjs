import {TypedJsNode} from "./_Base";
import {NodeParamsConfig} from "../utils/params/ParamsConfig";
class OutputJsParamsConfig extends NodeParamsConfig {
}
const ParamsConfig2 = new OutputJsParamsConfig();
export class OutputJsNode extends TypedJsNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "output";
  }
  initialize_node() {
    super.initialize_node();
    this.add_post_dirty_hook("_set_mat_to_recompile", this._set_function_node_to_recompile.bind(this));
  }
  create_params() {
    this.function_node?.assembler_controller.add_output_inputs(this);
  }
  set_lines(lines_controller) {
    this.function_node?.assembler_controller.assembler.set_node_lines_output(this, lines_controller);
  }
}

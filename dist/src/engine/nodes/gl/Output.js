import {TypedGlNode} from "./_Base";
import {NodeParamsConfig} from "../utils/params/ParamsConfig";
class OutputGlParamsConfig extends NodeParamsConfig {
}
const ParamsConfig2 = new OutputGlParamsConfig();
export class OutputGlNode extends TypedGlNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "output";
  }
  initialize_node() {
    super.initialize_node();
    this.add_post_dirty_hook("_set_mat_to_recompile", this._set_mat_to_recompile.bind(this));
    this.lifecycle.add_on_add_hook(() => {
      this.material_node?.assembler_controller?.add_output_inputs(this);
    });
  }
  set_lines(shaders_collection_controller) {
    this.material_node?.assembler_controller?.assembler.set_node_lines_output(this, shaders_collection_controller);
  }
}

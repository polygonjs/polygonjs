import {TypedGlNode} from "./_Base";
import {NodeParamsConfig} from "../utils/params/ParamsConfig";
class GlobalsGlParamsConfig extends NodeParamsConfig {
}
const ParamsConfig2 = new GlobalsGlParamsConfig();
export class GlobalsGlNode extends TypedGlNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "globals";
  }
  initialize_node() {
    super.initialize_node();
    this.lifecycle.add_on_add_hook(() => {
      this.material_node?.assembler_controller?.add_globals_outputs(this);
    });
  }
  set_lines(shaders_collection_controller) {
    this.material_node?.assembler_controller?.assembler.set_node_lines_globals(this, shaders_collection_controller);
  }
}

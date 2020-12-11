import {TypedCopNode} from "./_Base";
import {NodeParamsConfig} from "../utils/params/ParamsConfig";
import {InputCloneMode as InputCloneMode2} from "../../poly/InputCloneMode";
const ParamsConfig2 = new NodeParamsConfig();
export class NullCopNode extends TypedCopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "null";
  }
  initialize_node() {
    this.io.inputs.set_count(1);
    this.io.inputs.init_inputs_cloned_state(InputCloneMode2.NEVER);
  }
  async cook(input_contents) {
    const texture = input_contents[0];
    this.set_texture(texture);
  }
}

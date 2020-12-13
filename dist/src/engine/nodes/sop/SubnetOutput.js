import {TypedSopNode} from "./_Base";
import {NodeParamsConfig} from "../utils/params/ParamsConfig";
import {InputCloneMode as InputCloneMode2} from "../../poly/InputCloneMode";
import {NetworkChildNodeType} from "../../poly/NodeContext";
class SubnetOutputSopParamsConfig extends NodeParamsConfig {
}
const ParamsConfig2 = new SubnetOutputSopParamsConfig();
export class SubnetOutputSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return NetworkChildNodeType.OUTPUT;
  }
  initialize_node() {
    this.io.inputs.set_count(1);
    this.io.outputs.set_has_no_output();
    this.io.inputs.init_inputs_cloned_state(InputCloneMode2.NEVER);
  }
  cook(input_contents) {
    this.set_core_group(input_contents[0]);
  }
}

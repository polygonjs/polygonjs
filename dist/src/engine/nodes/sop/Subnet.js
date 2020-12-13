import {SubnetSopNodeLike} from "./utils/subnet/ChildrenDisplayController";
import {InputCloneMode as InputCloneMode2} from "../../poly/InputCloneMode";
import {NodeParamsConfig} from "../utils/params/ParamsConfig";
class SubnetSopParamsConfig extends NodeParamsConfig {
}
const ParamsConfig2 = new SubnetSopParamsConfig();
export class SubnetSopNode extends SubnetSopNodeLike {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "subnet";
  }
  initialize_node() {
    this.io.inputs.set_count(0, 4);
    this.io.inputs.init_inputs_cloned_state(InputCloneMode2.NEVER);
  }
}

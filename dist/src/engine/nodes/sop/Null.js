import {TypedSopNode} from "./_Base";
import {NullSopOperation} from "../../../core/operations/sop/Null";
import {NodeParamsConfig} from "../utils/params/ParamsConfig";
class NullSopParamsConfig extends NodeParamsConfig {
}
const ParamsConfig2 = new NullSopParamsConfig();
export class NullSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "null";
  }
  initialize_node() {
    this.io.inputs.set_count(0, 1);
    this.io.inputs.init_inputs_cloned_state(NullSopOperation.INPUT_CLONED_STATE);
  }
  cook(input_contents) {
    this._operation = this._operation || new NullSopOperation(this.scene, this.states);
    const core_group = this._operation.cook(input_contents, this.pv);
    this.set_core_group(core_group);
  }
}

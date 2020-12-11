import {TypedSopNode} from "./_Base";
import {CenterSopOperation} from "../../../core/operations/sop/Center";
import {NodeParamsConfig} from "../utils/params/ParamsConfig";
class CenterSopParamsConfig extends NodeParamsConfig {
}
const ParamsConfig2 = new CenterSopParamsConfig();
export class CenterSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "center";
  }
  initialize_node() {
    this.io.inputs.set_count(1);
    this.io.inputs.init_inputs_cloned_state(CenterSopOperation.INPUT_CLONED_STATE);
  }
  cook(input_contents) {
    this._operation = this._operation || new CenterSopOperation(this.scene, this.states);
    const core_group = this._operation.cook(input_contents, this.pv);
    this.set_core_group(core_group);
  }
}

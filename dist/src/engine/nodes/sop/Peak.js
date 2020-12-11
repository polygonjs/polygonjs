import {TypedSopNode} from "./_Base";
import {InputCloneMode as InputCloneMode2} from "../../poly/InputCloneMode";
import {PeakSopOperation} from "../../../core/operations/sop/Peak";
const DEFAULT = PeakSopOperation.DEFAULT_PARAMS;
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class PeakSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.amount = ParamConfig.FLOAT(DEFAULT.amount, {range: [-1, 1]});
  }
}
const ParamsConfig2 = new PeakSopParamsConfig();
export class PeakSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "peak";
  }
  initialize_node() {
    this.io.inputs.set_count(1);
    this.io.inputs.init_inputs_cloned_state(InputCloneMode2.FROM_NODE);
  }
  cook(input_contents) {
    this._operation = this._operation || new PeakSopOperation(this.scene, this.states);
    const core_group = this._operation.cook(input_contents, this.pv);
    this.set_core_group(core_group);
  }
}

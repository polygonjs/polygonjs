import {TypedSopNode} from "./_Base";
import {JitterSopOperation} from "../../../core/operations/sop/Jitter";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
const DEFAULT = JitterSopOperation.DEFAULT_PARAMS;
class JitterSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.amount = ParamConfig.FLOAT(DEFAULT.amount);
    this.mult = ParamConfig.VECTOR3(DEFAULT.mult);
    this.seed = ParamConfig.INTEGER(DEFAULT.seed, {range: [0, 100]});
  }
}
const ParamsConfig2 = new JitterSopParamsConfig();
export class JitterSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "jitter";
  }
  static displayed_input_names() {
    return ["geometry to jitter points of"];
  }
  initialize_node() {
    this.io.inputs.set_count(1);
    this.io.inputs.init_inputs_cloned_state(JitterSopOperation.INPUT_CLONED_STATE);
  }
  cook(input_contents) {
    this._operation = this._operation || new JitterSopOperation(this.scene, this.states);
    const core_group = this._operation.cook(input_contents, this.pv);
    this.set_core_group(core_group);
  }
}

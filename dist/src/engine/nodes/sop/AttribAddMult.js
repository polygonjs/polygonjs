import {TypedSopNode} from "./_Base";
import {AttribAddMultSopOperation} from "../../../core/operations/sop/AttribAddMult";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
const DEFAULT = AttribAddMultSopOperation.DEFAULT_PARAMS;
class AttribAddMultSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.name = ParamConfig.STRING(DEFAULT.name);
    this.pre_add = ParamConfig.FLOAT(DEFAULT.pre_add, {range: [0, 1]});
    this.mult = ParamConfig.FLOAT(DEFAULT.mult, {range: [0, 1]});
    this.post_add = ParamConfig.FLOAT(DEFAULT.post_add, {range: [0, 1]});
  }
}
const ParamsConfig2 = new AttribAddMultSopParamsConfig();
export class AttribAddMultSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "attrib_add_mult";
  }
  initialize_node() {
    this.io.inputs.set_count(1);
    this.io.inputs.init_inputs_cloned_state(AttribAddMultSopOperation.INPUT_CLONED_STATE);
  }
  cook(input_contents) {
    this._operation = this._operation || new AttribAddMultSopOperation(this.scene, this.states);
    const core_group = this._operation.cook(input_contents, this.pv);
    this.set_core_group(core_group);
  }
}

import {TypedSopNode} from "./_Base";
import {RoundedBoxSopOperation} from "../../../core/operations/sop/RoundedBox";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
const DEFAULT = RoundedBoxSopOperation.DEFAULT_PARAMS;
class BoxSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.size = ParamConfig.FLOAT(DEFAULT.size);
    this.divisions = ParamConfig.INTEGER(DEFAULT.divisions, {
      range: [1, 10],
      range_locked: [true, false]
    });
    this.bevel = ParamConfig.FLOAT(DEFAULT.bevel, {
      range: [0, 1],
      range_locked: [true, false]
    });
    this.center = ParamConfig.VECTOR3(DEFAULT.center);
  }
}
const ParamsConfig2 = new BoxSopParamsConfig();
export class RoundedBoxSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "rounded_box";
  }
  static displayed_input_names() {
    return ["geometry to create bounding box from (optional)"];
  }
  initialize_node() {
    this.io.inputs.set_count(0, 1);
    this.io.inputs.init_inputs_cloned_state(RoundedBoxSopOperation.INPUT_CLONED_STATE);
  }
  cook(input_contents) {
    this._operation = this._operation || new RoundedBoxSopOperation(this._scene, this.states);
    const core_group = this._operation.cook(input_contents, this.pv);
    this.set_core_group(core_group);
  }
}

import {TypedSopNode} from "./_Base";
import {BoxSopOperation} from "../../../core/operations/sop/Box";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
const DEFAULT = BoxSopOperation.DEFAULT_PARAMS;
class BoxSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.size = ParamConfig.FLOAT(DEFAULT.size);
    this.divisions = ParamConfig.INTEGER(DEFAULT.divisions, {
      range: [1, 10],
      range_locked: [true, false]
    });
    this.center = ParamConfig.VECTOR3(DEFAULT.center);
  }
}
const ParamsConfig2 = new BoxSopParamsConfig();
export class BoxSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "box";
  }
  static displayed_input_names() {
    return ["geometry to create bounding box from (optional)"];
  }
  initialize_node() {
    this.io.inputs.set_count(0, 1);
    this.io.inputs.init_inputs_cloned_state(BoxSopOperation.INPUT_CLONED_STATE);
  }
  cook(input_contents) {
    this._operation = this._operation || new BoxSopOperation(this._scene, this.states);
    const core_group = this._operation.cook(input_contents, this.pv);
    this.set_core_group(core_group);
  }
}

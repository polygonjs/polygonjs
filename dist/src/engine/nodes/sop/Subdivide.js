import {TypedSopNode} from "./_Base";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {SubdivideSopOperation} from "../../../core/operations/sop/Subdivide";
const DEFAULT = SubdivideSopOperation.DEFAULT_PARAMS;
class SubdivideSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.subdivisions = ParamConfig.INTEGER(DEFAULT.subdivisions, {
      range: [0, 5],
      range_locked: [true, false]
    });
  }
}
const ParamsConfig2 = new SubdivideSopParamsConfig();
export class SubdivideSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "subdivide";
  }
  initialize_node() {
    this.io.inputs.set_count(1);
  }
  cook(input_contents) {
    this._operation = this._operation || new SubdivideSopOperation(this.scene, this.states);
    const core_group = this._operation.cook(input_contents, this.pv);
    this.set_core_group(core_group);
  }
}

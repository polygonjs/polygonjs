import {TypedSopNode} from "./_Base";
import {TorusSopOperation} from "../../../core/operations/sop/Torus";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
const DEFAULT = TorusSopOperation.DEFAULT_PARAMS;
class TorusSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.radius = ParamConfig.FLOAT(DEFAULT.radius, {range: [0, 1]});
    this.radius_tube = ParamConfig.FLOAT(DEFAULT.radius_tube, {range: [0, 1]});
    this.segments_radial = ParamConfig.INTEGER(DEFAULT.segments_radial, {
      range: [1, 50],
      range_locked: [true, false]
    });
    this.segments_tube = ParamConfig.INTEGER(DEFAULT.segments_tube, {
      range: [1, 50],
      range_locked: [true, false]
    });
    this.center = ParamConfig.VECTOR3(DEFAULT.center);
  }
}
const ParamsConfig2 = new TorusSopParamsConfig();
export class TorusSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "torus";
  }
  cook(input_contents) {
    this._operation = this._operation || new TorusSopOperation(this.scene, this.states);
    const core_group = this._operation.cook(input_contents, this.pv);
    this.set_core_group(core_group);
  }
}

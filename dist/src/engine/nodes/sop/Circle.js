import {TypedSopNode} from "./_Base";
import {CircleSopOperation} from "../../../core/operations/sop/Circle";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
const DEFAULT = CircleSopOperation.DEFAULT_PARAMS;
class CircleSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.radius = ParamConfig.FLOAT(DEFAULT.radius);
    this.segments = ParamConfig.INTEGER(DEFAULT.segments, {
      range: [1, 50],
      range_locked: [true, false]
    });
    this.open = ParamConfig.BOOLEAN(DEFAULT.open);
    this.arc_angle = ParamConfig.FLOAT(DEFAULT.arc_angle, {
      range: [0, 360],
      range_locked: [false, false],
      visible_if: {open: 1}
    });
    this.direction = ParamConfig.VECTOR3(DEFAULT.direction);
  }
}
const ParamsConfig2 = new CircleSopParamsConfig();
export class CircleSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "circle";
  }
  initialize_node() {
  }
  cook() {
    this._operation = this._operation || new CircleSopOperation(this._scene, this.states);
    const core_group = this._operation.cook([], this.pv);
    this.set_core_group(core_group);
  }
}

import {TypedSopNode} from "./_Base";
import {IcosahedronSopOperation} from "../../../core/operations/sop/Icosahedron";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
const DEFAULT = IcosahedronSopOperation.DEFAULT_PARAMS;
class IcosahedronSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.radius = ParamConfig.FLOAT(DEFAULT.radius);
    this.detail = ParamConfig.INTEGER(DEFAULT.detail, {
      range: [0, 10],
      range_locked: [true, false]
    });
    this.points_only = ParamConfig.BOOLEAN(DEFAULT.points_only);
    this.center = ParamConfig.VECTOR3(DEFAULT.center);
  }
}
const ParamsConfig2 = new IcosahedronSopParamsConfig();
export class IcosahedronSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "icosahedron";
  }
  cook() {
    this._operation = this._operation || new IcosahedronSopOperation(this._scene, this.states);
    const core_group = this._operation.cook([], this.pv);
    this.set_core_group(core_group);
  }
}

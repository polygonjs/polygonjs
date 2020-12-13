import {TypedSopNode} from "./_Base";
import {TorusKnotSopOperation} from "../../../core/operations/sop/TorusKnot";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
const DEFAULT = TorusKnotSopOperation.DEFAULT_PARAMS;
class TorusKnotSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.radius = ParamConfig.FLOAT(DEFAULT.radius);
    this.radius_tube = ParamConfig.FLOAT(DEFAULT.radius_tube);
    this.segments_radial = ParamConfig.INTEGER(DEFAULT.segments_radial, {range: [1, 128]});
    this.segments_tube = ParamConfig.INTEGER(DEFAULT.segments_tube, {range: [1, 32]});
    this.p = ParamConfig.INTEGER(DEFAULT.p, {range: [1, 10]});
    this.q = ParamConfig.INTEGER(DEFAULT.q, {range: [1, 10]});
    this.center = ParamConfig.VECTOR3(DEFAULT.center);
  }
}
const ParamsConfig2 = new TorusKnotSopParamsConfig();
export class TorusKnotSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "torus_knot";
  }
  initialize_node() {
  }
  cook(input_contents) {
    this._operation = this._operation || new TorusKnotSopOperation(this.scene, this.states);
    const core_group = this._operation.cook(input_contents, this.pv);
    this.set_core_group(core_group);
  }
}

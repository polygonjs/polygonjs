import {TypedSopNode} from "./_Base";
import {SphereSopOperation, SPHERE_TYPES, SPHERE_TYPE} from "../../../core/operations/sop/Sphere";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
const DEFAULT = SphereSopOperation.DEFAULT_PARAMS;
class SphereSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.type = ParamConfig.INTEGER(DEFAULT.type, {
      menu: {
        entries: SPHERE_TYPES.map((name) => {
          return {name, value: SPHERE_TYPE[name]};
        })
      }
    });
    this.radius = ParamConfig.FLOAT(DEFAULT.radius, {visible_if: {type: SPHERE_TYPE.default}});
    this.resolution = ParamConfig.VECTOR2(DEFAULT.resolution, {visible_if: {type: SPHERE_TYPE.default}});
    this.open = ParamConfig.BOOLEAN(DEFAULT.open, {visible_if: {type: SPHERE_TYPE.default}});
    this.phi_start = ParamConfig.FLOAT(DEFAULT.phi_start, {
      range: [0, Math.PI * 2],
      visible_if: {type: SPHERE_TYPE.default, open: true}
    });
    this.phi_length = ParamConfig.FLOAT("$PI*2", {
      range: [0, Math.PI * 2],
      visible_if: {type: SPHERE_TYPE.default, open: true}
    });
    this.theta_start = ParamConfig.FLOAT(DEFAULT.theta_start, {
      range: [0, Math.PI],
      visible_if: {type: SPHERE_TYPE.default, open: true}
    });
    this.theta_length = ParamConfig.FLOAT("$PI", {
      range: [0, Math.PI],
      visible_if: {type: SPHERE_TYPE.default, open: true}
    });
    this.detail = ParamConfig.INTEGER(DEFAULT.detail, {
      range: [0, 5],
      range_locked: [true, false],
      visible_if: {type: SPHERE_TYPE.isocahedron}
    });
    this.center = ParamConfig.VECTOR3(DEFAULT.center);
  }
}
const ParamsConfig2 = new SphereSopParamsConfig();
export class SphereSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "sphere";
  }
  initialize_node() {
    this.io.inputs.set_count(0, 1);
    this.io.inputs.init_inputs_cloned_state(SphereSopOperation.INPUT_CLONED_STATE);
  }
  cook(input_contents) {
    this._operation = this._operation || new SphereSopOperation(this.scene, this.states);
    const core_group = this._operation.cook(input_contents, this.pv);
    this.set_core_group(core_group);
  }
}

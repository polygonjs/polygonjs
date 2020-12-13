import {TypedSopNode} from "./_Base";
import {ROTATION_ORDERS, TransformTargetType, TRANSFORM_TARGET_TYPES} from "../../../core/Transform";
import {TransformSopOperation} from "../../../core/operations/sop/Transform";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
const DEFAULT = TransformSopOperation.DEFAULT_PARAMS;
class TransformSopParamConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.apply_on = ParamConfig.INTEGER(DEFAULT.apply_on, {
      menu: {
        entries: TRANSFORM_TARGET_TYPES.map((target_type, i) => {
          return {name: target_type, value: i};
        })
      }
    });
    this.group = ParamConfig.STRING(DEFAULT.group, {
      visible_if: {apply_on: TRANSFORM_TARGET_TYPES.indexOf(TransformTargetType.GEOMETRIES)}
    });
    this.rotation_order = ParamConfig.INTEGER(DEFAULT.rotation_order, {
      menu: {
        entries: ROTATION_ORDERS.map((order, v) => {
          return {name: order, value: v};
        })
      }
    });
    this.t = ParamConfig.VECTOR3(DEFAULT.t);
    this.r = ParamConfig.VECTOR3(DEFAULT.r);
    this.s = ParamConfig.VECTOR3(DEFAULT.s);
    this.scale = ParamConfig.FLOAT(DEFAULT.scale, {range: [0, 10]});
    this.pivot = ParamConfig.VECTOR3(DEFAULT.pivot, {
      visible_if: {apply_on: TRANSFORM_TARGET_TYPES.indexOf(TransformTargetType.GEOMETRIES)}
    });
  }
}
const ParamsConfig2 = new TransformSopParamConfig();
export class TransformSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "transform";
  }
  static displayed_input_names() {
    return ["geometries or objects to transform"];
  }
  initialize_node() {
    this.io.inputs.set_count(1);
    this.io.inputs.init_inputs_cloned_state(TransformSopOperation.INPUT_CLONED_STATE);
    this.scene.dispatch_controller.on_add_listener(() => {
      this.params.on_params_created("params_label", () => {
        this.params.label.init([this.p.apply_on], () => {
          return TRANSFORM_TARGET_TYPES[this.pv.apply_on];
        });
      });
    });
  }
  cook(input_contents) {
    this._operation = this._operation || new TransformSopOperation(this.scene, this.states);
    const core_group = this._operation.cook(input_contents, this.pv);
    this.set_core_group(core_group);
  }
}

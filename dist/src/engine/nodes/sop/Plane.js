import {TypedSopNode} from "./_Base";
import {PlaneSopOperation} from "../../../core/operations/sop/Plane";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
const DEFAULT = PlaneSopOperation.DEFAULT_PARAMS;
class PlaneSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.size = ParamConfig.VECTOR2(DEFAULT.size);
    this.use_segments_count = ParamConfig.BOOLEAN(DEFAULT.use_segments_count);
    this.step_size = ParamConfig.FLOAT(DEFAULT.step_size, {
      range: [1e-3, 1],
      range_locked: [false, false],
      visible_if: {use_segments_count: 0}
    });
    this.segments = ParamConfig.VECTOR2(DEFAULT.segments, {visible_if: {use_segments_count: 1}});
    this.direction = ParamConfig.VECTOR3(DEFAULT.direction);
    this.center = ParamConfig.VECTOR3(DEFAULT.center);
  }
}
const ParamsConfig2 = new PlaneSopParamsConfig();
export class PlaneSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "plane";
  }
  static displayed_input_names() {
    return ["geometry to create plane from (optional)"];
  }
  initialize_node() {
    this.io.inputs.set_count(0, 1);
    this.io.inputs.init_inputs_cloned_state(PlaneSopOperation.INPUT_CLONED_STATE);
  }
  cook(input_contents) {
    this._operation = this._operation || new PlaneSopOperation(this.scene, this.states);
    const core_group = this._operation.cook(input_contents, this.pv);
    this.set_core_group(core_group);
  }
}

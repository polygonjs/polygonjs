import {TypedSopNode} from "./_Base";
import {AddSopOperation} from "../../../core/operations/sop/Add";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
const DEFAULT = AddSopOperation.DEFAULT_PARAMS;
class AddSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.create_point = ParamConfig.BOOLEAN(DEFAULT.create_point);
    this.points_count = ParamConfig.INTEGER(DEFAULT.points_count, {
      range: [1, 100],
      range_locked: [true, false],
      visible_if: {create_point: true}
    });
    this.position = ParamConfig.VECTOR3(DEFAULT.position, {visible_if: {create_point: true}});
    this.open = ParamConfig.BOOLEAN(DEFAULT.open);
    this.connect_to_last_point = ParamConfig.BOOLEAN(DEFAULT.connect_to_last_point);
  }
}
const ParamsConfig2 = new AddSopParamsConfig();
export class AddSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "add";
  }
  static displayed_input_names() {
    return ["geometry to create polygons from (optional)"];
  }
  initialize_node() {
    this.io.inputs.set_count(0, 1);
  }
  cook(input_contents) {
    this._operation = this._operation || new AddSopOperation(this.scene, this.states);
    const core_group = this._operation.cook(input_contents, this.pv);
    this.set_core_group(core_group);
  }
}

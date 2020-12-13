import {TypedSopNode} from "./_Base";
import {ObjectPropertiesSopOperation} from "../../../core/operations/sop/ObjectProperties";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
const DEFAULT = ObjectPropertiesSopOperation.DEFAULT_PARAMS;
class ObjectPropertiesSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.apply_to_children = ParamConfig.BOOLEAN(DEFAULT.apply_to_children);
    this.separator = ParamConfig.SEPARATOR();
    this.tname = ParamConfig.BOOLEAN(DEFAULT.tname);
    this.name = ParamConfig.STRING(DEFAULT.name, {visible_if: {tname: true}});
    this.trender_order = ParamConfig.BOOLEAN(DEFAULT.trender_order);
    this.render_order = ParamConfig.INTEGER(DEFAULT.render_order, {
      visible_if: {trender_order: true},
      range: [0, 10],
      range_locked: [false, false]
    });
    this.frustrum_culled = ParamConfig.BOOLEAN(DEFAULT.frustrum_culled);
    this.matrix_auto_update = ParamConfig.BOOLEAN(DEFAULT.matrix_auto_update);
    this.visible = ParamConfig.BOOLEAN(DEFAULT.visible);
    this.cast_shadow = ParamConfig.BOOLEAN(DEFAULT.cast_shadow);
    this.receive_shadow = ParamConfig.BOOLEAN(DEFAULT.receive_shadow);
  }
}
const ParamsConfig2 = new ObjectPropertiesSopParamsConfig();
export class ObjectPropertiesSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "object_properties";
  }
  static displayed_input_names() {
    return ["objects to change properties of"];
  }
  initialize_node() {
    this.io.inputs.set_count(1);
    this.io.inputs.init_inputs_cloned_state(ObjectPropertiesSopOperation.INPUT_CLONED_STATE);
  }
  async cook(input_contents) {
    this._operation = this._operation || new ObjectPropertiesSopOperation(this.scene, this.states);
    const core_group = this._operation.cook(input_contents, this.pv);
    this.set_core_group(core_group);
  }
}

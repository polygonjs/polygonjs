import {TypedSopNode} from "./_Base";
import {Css2DObjectSopOperation} from "../../../core/operations/sop/Css2DObject";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
const DEFAULT = Css2DObjectSopOperation.DEFAULT_PARAMS;
class Css2DObjectSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.use_id_attrib = ParamConfig.BOOLEAN(DEFAULT.use_id_attrib);
    this.id = ParamConfig.STRING(DEFAULT.id, {
      visible_if: {use_id_attrib: 0}
    });
    this.use_class_attrib = ParamConfig.BOOLEAN(DEFAULT.use_class_attrib);
    this.class_name = ParamConfig.STRING(DEFAULT.class_name, {
      visible_if: {use_class_attrib: 0}
    });
    this.use_html_attrib = ParamConfig.BOOLEAN(DEFAULT.use_html_attrib);
    this.html = ParamConfig.STRING(DEFAULT.html, {
      visible_if: {use_html_attrib: 0},
      multiline: true
    });
    this.copy_attributes = ParamConfig.BOOLEAN(DEFAULT.copy_attributes);
    this.attributes_to_copy = ParamConfig.STRING(DEFAULT.attributes_to_copy, {
      visible_if: {copy_attributes: true}
    });
  }
}
const ParamsConfig2 = new Css2DObjectSopParamsConfig();
export class Css2DObjectSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "css2d_object";
  }
  initialize_node() {
    this.io.inputs.set_count(0, 1);
  }
  cook(input_contents) {
    this._operation = this._operation || new Css2DObjectSopOperation(this.scene, this.states);
    const core_group = this._operation.cook(input_contents, this.pv);
    this.set_core_group(core_group);
  }
}

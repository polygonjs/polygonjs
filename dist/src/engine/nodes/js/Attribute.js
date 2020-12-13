import lodash_trim from "lodash/trim";
import {TypedJsNode} from "./_Base";
import {ParamType as ParamType2} from "../../poly/ParamType";
const ATTRIBUTE_NODE_AVAILABLE_JS_TYPES = [
  JsConnectionPointType.FLOAT,
  JsConnectionPointType.VEC2,
  JsConnectionPointType.VEC3,
  JsConnectionPointType.VEC4
];
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {JsConnectionPointType} from "../utils/io/connections/Js";
class AttributeJsParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.name = ParamConfig.STRING("");
    this.type = ParamConfig.INTEGER(0, {
      menu: {
        entries: ATTRIBUTE_NODE_AVAILABLE_JS_TYPES.map((name, i) => {
          return {name, value: i};
        })
      }
    });
  }
}
const ParamsConfig2 = new AttributeJsParamsConfig();
const AttributeJsNode2 = class extends TypedJsNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this._on_create_set_name_if_none_bound = this._on_create_set_name_if_none.bind(this);
  }
  static type() {
    return "attribute";
  }
  initialize_node() {
    this.add_post_dirty_hook("_set_mat_to_recompile", this._set_mat_to_recompile_if_is_exporting.bind(this));
    this.lifecycle.add_on_create_hook(this._on_create_set_name_if_none_bound);
    this.io.connection_points.initialize_node();
    this.io.connection_points.set_expected_input_types_function(() => []);
    this.io.connection_points.set_expected_output_types_function(() => [
      ATTRIBUTE_NODE_AVAILABLE_JS_TYPES[this.pv.type]
    ]);
  }
  create_params() {
    if (this.function_node?.assembler_controller.allow_attribute_exports()) {
      this.add_param(ParamType2.BOOLEAN, "export_when_connected", 0);
    }
  }
  get input_name() {
    return AttributeJsNode2.INPUT_NAME;
  }
  get output_name() {
    return AttributeJsNode2.OUTPUT_NAME;
  }
  set_lines(lines_controller) {
    this.function_node?.assembler_controller.assembler.set_node_lines_attribute(this, lines_controller);
  }
  get attribute_name() {
    return lodash_trim(this.pv.name);
  }
  gl_type() {
    return this.io.outputs.named_output_connection_points[0].type;
  }
  set_gl_type(type) {
    this.p.type.set(ATTRIBUTE_NODE_AVAILABLE_JS_TYPES.indexOf(type));
  }
  connected_input_node() {
    return this.io.inputs.named_input(AttributeJsNode2.INPUT_NAME);
  }
  connected_input_connection_point() {
    return this.io.inputs.named_input_connection_point(AttributeJsNode2.INPUT_NAME);
  }
  output_connection_point() {
    return this.io.outputs.named_output_connection_points_by_name(this.input_name);
  }
  get is_importing() {
    return this.io.outputs.used_output_names().length > 0;
  }
  get is_exporting() {
    if (this.pv.export_when_connected) {
      const input_node = this.io.inputs.named_input(AttributeJsNode2.INPUT_NAME);
      return input_node != null;
    } else {
      return false;
    }
  }
  _set_mat_to_recompile_if_is_exporting() {
    if (this.is_exporting) {
      this._set_function_node_to_recompile();
    }
  }
  _on_create_set_name_if_none() {
    if (this.pv.name == "") {
      this.p.name.set(this.name);
    }
  }
};
export let AttributeJsNode = AttributeJsNode2;
AttributeJsNode.INPUT_NAME = "export";
AttributeJsNode.OUTPUT_NAME = "val";

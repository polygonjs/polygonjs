import {TypedGlNode} from "./_Base";
import Quaternion from "./gl/quaternion.glsl";
import {FunctionGLDefinition} from "./utils/GLDefinition";
import {GlConnectionPointType} from "../utils/io/connections/Gl";
export var GlRotateMode;
(function(GlRotateMode2) {
  GlRotateMode2[GlRotateMode2["AXIS"] = 0] = "AXIS";
  GlRotateMode2[GlRotateMode2["QUAT"] = 1] = "QUAT";
})(GlRotateMode || (GlRotateMode = {}));
const Modes = [0, 1];
const LabelByMode = {
  [0]: "from axis + angle",
  [1]: "from quaternion"
};
const InputNamesByMode = {
  [0]: ["vector", "axis", "angle"],
  [1]: ["vector", "quat"]
};
const MethodNameByMode = {
  [0]: "rotate_with_axis_angle",
  [1]: "rotate_with_quat"
};
const InputTypesByMode = {
  [0]: [GlConnectionPointType.VEC3, GlConnectionPointType.VEC3, GlConnectionPointType.FLOAT],
  [1]: [GlConnectionPointType.VEC3, GlConnectionPointType.VEC4]
};
const DefaultValues = {
  vector: [0, 0, 1],
  axis: [0, 1, 0]
};
import {ParamConfig, NodeParamsConfig} from "../utils/params/ParamsConfig";
import {ThreeToGl as ThreeToGl2} from "../../../core/ThreeToGl";
class RotateParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.signature = ParamConfig.INTEGER(0, {
      menu: {
        entries: Modes.map((mode, i) => {
          const label = LabelByMode[mode];
          return {name: label, value: i};
        })
      }
    });
  }
}
const ParamsConfig2 = new RotateParamsConfig();
export class RotateGlNode extends TypedGlNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "rotate";
  }
  initialize_node() {
    super.initialize_node();
    this.io.connection_points.set_expected_input_types_function(this._expected_input_types.bind(this));
    this.io.connection_points.set_expected_output_types_function(this._expected_output_types.bind(this));
    this.io.connection_points.set_input_name_function(this._gl_input_name.bind(this));
  }
  set_signature(mode) {
    const index = Modes.indexOf(mode);
    this.p.signature.set(index);
  }
  _gl_input_name(index) {
    const mode = Modes[this.pv.signature];
    return InputNamesByMode[mode][index];
  }
  param_default_value(name) {
    return DefaultValues[name];
  }
  gl_method_name() {
    const mode = Modes[this.pv.signature];
    return MethodNameByMode[mode];
  }
  _expected_input_types() {
    const mode = Modes[this.pv.signature];
    return InputTypesByMode[mode];
  }
  _expected_output_types() {
    return [GlConnectionPointType.VEC3];
  }
  gl_function_definitions() {
    return [new FunctionGLDefinition(this, Quaternion)];
  }
  set_lines(shaders_collection_controller) {
    const var_type = this.io.outputs.named_output_connection_points[0].type;
    const args = this.io.inputs.named_input_connection_points.map((connection, i) => {
      const name = connection.name;
      return ThreeToGl2.any(this.variable_for_input(name));
    });
    const joined_args = args.join(", ");
    const sum = this.gl_var_name(this.io.connection_points.output_name(0));
    const body_line = `${var_type} ${sum} = ${this.gl_method_name()}(${joined_args})`;
    shaders_collection_controller.add_body_lines(this, [body_line]);
    shaders_collection_controller.add_definitions(this, this.gl_function_definitions());
  }
}

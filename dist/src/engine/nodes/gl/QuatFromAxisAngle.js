import {BaseNodeGlMathFunctionArg2GlNode} from "./_BaseMathFunction";
import Quaternion from "./gl/quaternion.glsl";
import {GlConnectionPointType} from "../utils/io/connections/Gl";
import {FunctionGLDefinition} from "./utils/GLDefinition";
var InputName;
(function(InputName2) {
  InputName2["AXIS"] = "axis";
  InputName2["ANGLE"] = "angle";
})(InputName || (InputName = {}));
const InputNames = [InputName.AXIS, InputName.ANGLE];
const DEFAULT_AXIS = [0, 0, 1];
const DEFAULT_ANGLE = 0;
const DefaultValues = {
  [InputName.AXIS]: DEFAULT_AXIS,
  [InputName.ANGLE]: DEFAULT_ANGLE
};
export class QuatFromAxisAngleGlNode extends BaseNodeGlMathFunctionArg2GlNode {
  static type() {
    return "quat_from_axis_angle";
  }
  initialize_node() {
    super.initialize_node();
    this.io.connection_points.set_input_name_function((index) => InputNames[index]);
    this.io.connection_points.set_expected_input_types_function(() => [
      GlConnectionPointType.VEC3,
      GlConnectionPointType.FLOAT
    ]);
    this.io.connection_points.set_expected_output_types_function(() => [GlConnectionPointType.VEC4]);
  }
  param_default_value(name) {
    return DefaultValues[name];
  }
  gl_method_name() {
    return "quat_from_axis_angle";
  }
  gl_function_definitions() {
    return [new FunctionGLDefinition(this, Quaternion)];
  }
}

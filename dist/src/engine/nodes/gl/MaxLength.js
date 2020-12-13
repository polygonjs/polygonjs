import {BaseNodeGlMathFunctionArg2GlNode} from "./_BaseMathFunction";
import MaxLength from "./gl/max_length.glsl";
import {FunctionGLDefinition} from "./utils/GLDefinition";
import {GlConnectionPointType} from "../utils/io/connections/Gl";
const MaxLengthDefaultValues = {
  max: 1
};
export class MaxLengthGlNode extends BaseNodeGlMathFunctionArg2GlNode {
  static type() {
    return "max_length";
  }
  _expected_input_types() {
    const type = this.io.connection_points.first_input_connection_type() || GlConnectionPointType.VEC3;
    return [type, GlConnectionPointType.FLOAT];
  }
  _gl_input_name(index) {
    return ["val", "max"][index];
  }
  param_default_value(name) {
    return MaxLengthDefaultValues[name];
  }
  gl_method_name() {
    return "max_length";
  }
  gl_function_definitions() {
    return [new FunctionGLDefinition(this, MaxLength)];
  }
}

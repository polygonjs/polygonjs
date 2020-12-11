import {BaseNodeGlMathFunctionArg1GlNode} from "./_BaseMathFunction";
import Quaternion from "./gl/quaternion.glsl";
import {GlConnectionPointType} from "../utils/io/connections/Gl";
import {FunctionGLDefinition} from "./utils/GLDefinition";
export class QuatToAngleGlNode extends BaseNodeGlMathFunctionArg1GlNode {
  static type() {
    return "quat_to_angle";
  }
  initialize_node() {
    super.initialize_node();
    this.io.connection_points.set_input_name_function((index) => ["quat"][index]);
    this.io.connection_points.set_expected_input_types_function(() => [GlConnectionPointType.VEC4]);
    this.io.connection_points.set_expected_output_types_function(() => [GlConnectionPointType.FLOAT]);
  }
  gl_method_name() {
    return "quat_to_angle";
  }
  gl_function_definitions() {
    return [new FunctionGLDefinition(this, Quaternion)];
  }
}

import {BaseNodeGlMathFunctionArg2GlNode} from "./_BaseMathFunction";
import Quaternion from "./gl/quaternion.glsl";
import {GlConnectionPointType} from "../utils/io/connections/Gl";
import {FunctionGLDefinition} from "./utils/GLDefinition";
var InputName;
(function(InputName2) {
  InputName2["DIR"] = "dir";
  InputName2["UP"] = "up";
})(InputName || (InputName = {}));
const InputNames = [InputName.DIR, InputName.UP];
const DEFAULT_DIR = [0, 0, 1];
const DEFAULT_UP = [0, 1, 0];
const DefaultValues = {
  [InputName.DIR]: DEFAULT_DIR,
  [InputName.UP]: DEFAULT_UP
};
export class AlignGlNode extends BaseNodeGlMathFunctionArg2GlNode {
  static type() {
    return "align";
  }
  initialize_node() {
    super.initialize_node();
    this.io.connection_points.set_input_name_function((index) => InputNames[index]);
    this.io.connection_points.set_expected_input_types_function(() => [
      GlConnectionPointType.VEC3,
      GlConnectionPointType.VEC3
    ]);
    this.io.connection_points.set_expected_output_types_function(() => [GlConnectionPointType.VEC4]);
  }
  param_default_value(name) {
    return DefaultValues[name];
  }
  gl_method_name() {
    return "align";
  }
  gl_function_definitions() {
    return [new FunctionGLDefinition(this, Quaternion)];
  }
}

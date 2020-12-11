import {BaseNodeGlMathFunctionArg5GlNode} from "./_BaseMathFunction";
import {BaseNodeGlMathFunctionArg3GlNode} from "./_BaseMathFunction";
import FitMethods from "./gl/fit.glsl";
import {FunctionGLDefinition} from "./utils/GLDefinition";
const FitDefaultValues = {
  src_min: 0,
  src_max: 1,
  dest_min: 0,
  dest_max: 1
};
export class FitGlNode extends BaseNodeGlMathFunctionArg5GlNode {
  static type() {
    return "fit";
  }
  _gl_input_name(index) {
    return ["val", "src_min", "src_max", "dest_min", "dest_max"][index];
  }
  param_default_value(name) {
    return FitDefaultValues[name];
  }
  gl_method_name() {
    return "fit";
  }
  gl_function_definitions() {
    return [new FunctionGLDefinition(this, FitMethods)];
  }
}
const FitTo01DefaultValues = {
  src_min: 0,
  src_max: 1
};
export class FitTo01GlNode extends BaseNodeGlMathFunctionArg3GlNode {
  static type() {
    return "fit_to_01";
  }
  _gl_input_name(index) {
    return ["val", "src_min", "src_max"][index];
  }
  param_default_value(name) {
    return FitTo01DefaultValues[name];
  }
  gl_method_name() {
    return "fit_to_01";
  }
  gl_function_definitions() {
    return [new FunctionGLDefinition(this, FitMethods)];
  }
}
const FitFrom01DefaultValues = {
  dest_min: 0,
  dest_max: 1
};
export class FitFrom01GlNode extends BaseNodeGlMathFunctionArg3GlNode {
  static type() {
    return "fit_from_01";
  }
  _gl_input_name(index) {
    return ["val", "dest_min", "dest_max"][index];
  }
  param_default_value(name) {
    return FitFrom01DefaultValues[name];
  }
  gl_method_name() {
    return "fit_from_01";
  }
  gl_function_definitions() {
    return [new FunctionGLDefinition(this, FitMethods)];
  }
}
const FitFrom01ToVarianceDefaultValues = {
  center: 0.5,
  variance: 0.5
};
export class FitFrom01ToVarianceGlNode extends BaseNodeGlMathFunctionArg3GlNode {
  static type() {
    return "fit_from_01_to_variance";
  }
  _gl_input_name(index) {
    return ["val", "center", "variance"][index];
  }
  param_default_value(name) {
    return FitFrom01ToVarianceDefaultValues[name];
  }
  gl_method_name() {
    return "fit_from_01_to_variance";
  }
  gl_function_definitions() {
    return [new FunctionGLDefinition(this, FitMethods)];
  }
}

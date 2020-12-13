import {TypedGlNode} from "./_Base";
import {ThreeToGl as ThreeToGl2} from "../../../../src/core/ThreeToGl";
import Hsv2Rgb from "./gl/hsv2rgb.glsl";
import {GlConnectionPointType, GlConnectionPoint} from "../utils/io/connections/Gl";
import {FunctionGLDefinition} from "./utils/GLDefinition";
const OUTPUT_NAME = "rgb";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class HsvToRgbGlParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.hsv = ParamConfig.VECTOR3([1, 1, 1]);
  }
}
const ParamsConfig2 = new HsvToRgbGlParamsConfig();
export class HsvToRgbGlNode extends TypedGlNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "hsv_to_rgb";
  }
  initialize_node() {
    super.initialize_node();
    this.io.outputs.set_named_output_connection_points([
      new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.VEC3)
    ]);
  }
  set_lines(shaders_collection_controller) {
    const function_declaration_lines = [];
    const body_lines = [];
    function_declaration_lines.push(new FunctionGLDefinition(this, Hsv2Rgb));
    const value = ThreeToGl2.vector3(this.variable_for_input(this.p.hsv.name));
    const rgb = this.gl_var_name(OUTPUT_NAME);
    body_lines.push(`vec3 ${rgb} = hsv2rgb(${value})`);
    shaders_collection_controller.add_definitions(this, function_declaration_lines);
    shaders_collection_controller.add_body_lines(this, body_lines);
  }
}

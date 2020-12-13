import {TypedGlNode} from "./_Base";
import {ThreeToGl as ThreeToGl2} from "../../../../src/core/ThreeToGl";
import Rgb2Hsv from "./gl/rgb2hsv.glsl";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {FunctionGLDefinition} from "./utils/GLDefinition";
import {GlConnectionPoint, GlConnectionPointType} from "../utils/io/connections/Gl";
const OUTPUT_NAME = "hsv";
class RgbToHsvGlParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.rgb = ParamConfig.VECTOR3([1, 1, 1]);
  }
}
const ParamsConfig2 = new RgbToHsvGlParamsConfig();
export class RgbToHsvGlNode extends TypedGlNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "rgb_to_hsv";
  }
  initialize_node() {
    this.io.outputs.set_named_output_connection_points([
      new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.VEC3)
    ]);
  }
  set_lines(shaders_collection_controller) {
    const function_declaration_lines = [];
    const body_lines = [];
    function_declaration_lines.push(new FunctionGLDefinition(this, Rgb2Hsv));
    const rgb = ThreeToGl2.vector3(this.variable_for_input("rgb"));
    const hsv = this.gl_var_name("hsv");
    body_lines.push(`vec3 ${hsv} = rgb2hsv(${rgb})`);
    shaders_collection_controller.add_definitions(this, function_declaration_lines);
    shaders_collection_controller.add_body_lines(this, body_lines);
  }
}

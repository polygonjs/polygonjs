import {TypedGlNode} from "./_Base";
import {GlConnectionPointType, GlConnectionPoint} from "../utils/io/connections/Gl";
import {ThreeToGl as ThreeToGl2} from "../../../core/ThreeToGl";
const OUTPUT_NAME = "lum";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class LuminanceGlParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.color = ParamConfig.VECTOR3([1, 1, 1]);
  }
}
const ParamsConfig2 = new LuminanceGlParamsConfig();
export class LuminanceGlNode extends TypedGlNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "luminance";
  }
  initialize_node() {
    super.initialize_node();
    this.io.outputs.set_named_output_connection_points([
      new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.FLOAT)
    ]);
  }
  set_lines(shaders_collection_controller) {
    const value = ThreeToGl2.vector3(this.variable_for_input("color"));
    const lum = this.gl_var_name("lum");
    const body_line = `float ${lum} = linearToRelativeLuminance(${value})`;
    shaders_collection_controller.add_body_lines(this, [body_line]);
  }
}

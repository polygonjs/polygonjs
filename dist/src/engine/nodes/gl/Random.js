import {TypedGlNode} from "./_Base";
import {ThreeToGl as ThreeToGl2} from "../../../../src/core/ThreeToGl";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {GlConnectionPoint, GlConnectionPointType} from "../utils/io/connections/Gl";
const OUTPUT_NAME = "rand";
class RandomGlParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.seed = ParamConfig.VECTOR2([1, 1]);
  }
}
const ParamsConfig2 = new RandomGlParamsConfig();
export class RandomGlNode extends TypedGlNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "random";
  }
  initialize_node() {
    super.initialize_node();
    this.io.outputs.set_named_output_connection_points([
      new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.FLOAT)
    ]);
  }
  set_lines(shaders_collection_controller) {
    const input_name = this.io.inputs.named_input_connection_points[0].name;
    const value = ThreeToGl2.vector2(this.variable_for_input(input_name));
    const float = this.gl_var_name(OUTPUT_NAME);
    const body_line = `float ${float} = rand(${value})`;
    shaders_collection_controller.add_body_lines(this, [body_line]);
  }
}

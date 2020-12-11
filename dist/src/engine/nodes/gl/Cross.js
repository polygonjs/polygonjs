import {TypedGlNode} from "./_Base";
import {ThreeToGl as ThreeToGl2} from "../../../../src/core/ThreeToGl";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {GlConnectionPoint, GlConnectionPointType} from "../utils/io/connections/Gl";
const OUTPUT_NAME = "cross";
class CrossGlParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.x = ParamConfig.VECTOR3([0, 0, 1]);
    this.y = ParamConfig.VECTOR3([0, 1, 0]);
  }
}
const ParamsConfig2 = new CrossGlParamsConfig();
export class CrossGlNode extends TypedGlNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "cross";
  }
  initialize_node() {
    super.initialize_node();
    this.io.outputs.set_named_output_connection_points([
      new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.VEC3)
    ]);
  }
  set_lines(shaders_collection_controller) {
    const x = ThreeToGl2.float(this.variable_for_input("x"));
    const y = ThreeToGl2.float(this.variable_for_input("y"));
    const result = this.gl_var_name(OUTPUT_NAME);
    const body_line = `vec3 ${result} = cross(${x}, ${y})`;
    shaders_collection_controller.add_body_lines(this, [body_line]);
  }
}

import {TypedGlNode} from "./_Base";
import {ThreeToGl as ThreeToGl2} from "../../../../src/core/ThreeToGl";
import DiskMethods from "./gl/disk.glsl";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {GlConnectionPointType, GlConnectionPoint} from "../utils/io/connections/Gl";
import {FunctionGLDefinition} from "./utils/GLDefinition";
const OUTPUT_NAME = "float";
class DiskGlParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.position = ParamConfig.VECTOR2([0, 0]);
    this.center = ParamConfig.VECTOR2([0, 0]);
    this.radius = ParamConfig.FLOAT(1);
    this.feather = ParamConfig.FLOAT(0.1);
  }
}
const ParamsConfig2 = new DiskGlParamsConfig();
export class DiskGlNode extends TypedGlNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "disk";
  }
  initialize_node() {
    super.initialize_node();
    this.io.outputs.set_named_output_connection_points([
      new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.FLOAT)
    ]);
  }
  set_lines(shaders_collection_controller) {
    const position = ThreeToGl2.vector2(this.variable_for_input("position"));
    const center = ThreeToGl2.vector2(this.variable_for_input("center"));
    const radius = ThreeToGl2.float(this.variable_for_input("radius"));
    const feather = ThreeToGl2.float(this.variable_for_input("feather"));
    const float = this.gl_var_name("float");
    const body_line = `float ${float} = disk2d(${position}, ${center}, ${radius}, ${feather})`;
    shaders_collection_controller.add_body_lines(this, [body_line]);
    shaders_collection_controller.add_definitions(this, [new FunctionGLDefinition(this, DiskMethods)]);
  }
}

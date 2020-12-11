import {TypedGlNode} from "./_Base";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {GlConnectionPointType, GlConnectionPoint} from "../utils/io/connections/Gl";
import {ShaderName as ShaderName2} from "../utils/shaders/ShaderName";
import {ThreeToGl as ThreeToGl2} from "../../../core/ThreeToGl";
const OUTPUT_NAME = "mvMult";
class ModelViewMatrixMultGlParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.vector = ParamConfig.VECTOR3([0, 0, 0]);
  }
}
const ParamsConfig2 = new ModelViewMatrixMultGlParamsConfig();
export class ModelViewMatrixMultGlNode extends TypedGlNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "model_view_matrix_mult";
  }
  initialize_node() {
    super.initialize_node();
    this.io.outputs.set_named_output_connection_points([
      new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.VEC4)
    ]);
  }
  set_lines(shaders_collection_controller) {
    if (shaders_collection_controller.current_shader_name == ShaderName2.VERTEX) {
      const input = ThreeToGl2.vector3(this.variable_for_input("vector"));
      const out_value = this.gl_var_name(OUTPUT_NAME);
      const body_line = `vec4 ${out_value} = modelViewMatrix * vec4(${input}, 1.0)`;
      shaders_collection_controller.add_body_lines(this, [body_line], ShaderName2.VERTEX);
    }
  }
}

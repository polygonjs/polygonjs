import {TypedGlNode} from "./_Base";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {GlConnectionPointType, GlConnectionPoint} from "../utils/io/connections/Gl";
import {VaryingGLDefinition, FunctionGLDefinition} from "./utils/GLDefinition";
import {ShaderName as ShaderName2} from "../utils/shaders/ShaderName";
import FogGlsl from "./gl/fog.glsl";
import {ThreeToGl as ThreeToGl2} from "../../../core/ThreeToGl";
const OUTPUT_NAME = "color";
class FogGlParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.mvPosition = ParamConfig.VECTOR4([0, 0, 0, 0]);
    this.base_color = ParamConfig.COLOR([0, 0, 0]);
    this.fog_color = ParamConfig.COLOR([1, 1, 1]);
    this.near = ParamConfig.FLOAT(0);
    this.far = ParamConfig.FLOAT(0);
  }
}
const ParamsConfig2 = new FogGlParamsConfig();
export class FogGlNode extends TypedGlNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "fog";
  }
  initialize_node() {
    super.initialize_node();
    this.io.outputs.set_named_output_connection_points([
      new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.VEC3)
    ]);
  }
  set_lines(shaders_collection_controller) {
    if (shaders_collection_controller.current_shader_name == ShaderName2.FRAGMENT) {
      const varying_name = this.gl_var_name(this.name);
      const definition = new VaryingGLDefinition(this, GlConnectionPointType.VEC4, varying_name);
      const vertex_body_line = `${varying_name} = modelViewMatrix * vec4(position, 1.0)`;
      shaders_collection_controller.add_definitions(this, [definition], ShaderName2.VERTEX);
      shaders_collection_controller.add_body_lines(this, [vertex_body_line], ShaderName2.VERTEX);
      const function_definition = new FunctionGLDefinition(this, FogGlsl);
      const mvPosition = ThreeToGl2.vector4(this.variable_for_input("mvPosition"));
      const base_color = ThreeToGl2.vector3(this.variable_for_input("base_color"));
      const fog_color = ThreeToGl2.vector3(this.variable_for_input("fog_color"));
      const near = ThreeToGl2.vector3(this.variable_for_input("near"));
      const far = ThreeToGl2.vector3(this.variable_for_input("far"));
      const out_value = this.gl_var_name(OUTPUT_NAME);
      const args = [mvPosition, base_color, fog_color, near, far].join(", ");
      const body_line = `vec3 ${out_value} = compute_fog(${args})`;
      shaders_collection_controller.add_definitions(this, [definition, function_definition]);
      shaders_collection_controller.add_body_lines(this, [body_line]);
    }
  }
}

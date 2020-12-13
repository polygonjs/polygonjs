import {TypedGlNode} from "./_Base";
import {ThreeToGl as ThreeToGl2} from "../../../core/ThreeToGl";
import {GlConnectionPointType, GlConnectionPoint} from "../utils/io/connections/Gl";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class FloatToVec2GlParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.x = ParamConfig.FLOAT(0);
    this.y = ParamConfig.FLOAT(0);
  }
}
const ParamsConfig2 = new FloatToVec2GlParamsConfig();
const FloatToVec2GlNode2 = class extends TypedGlNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "float_to_vec2";
  }
  initialize_node() {
    this.io.outputs.set_named_output_connection_points([
      new GlConnectionPoint(FloatToVec2GlNode2.OUTPUT_NAME, GlConnectionPointType.VEC2)
    ]);
  }
  set_lines(shaders_collection_controller) {
    const x = this.variable_for_input("x");
    const y = this.variable_for_input("y");
    const vec = this.gl_var_name(FloatToVec2GlNode2.OUTPUT_NAME);
    const body_line = `vec2 ${vec} = ${ThreeToGl2.float2(x, y)}`;
    shaders_collection_controller.add_body_lines(this, [body_line]);
  }
};
export let FloatToVec2GlNode = FloatToVec2GlNode2;
FloatToVec2GlNode.OUTPUT_NAME = "vec2";
class FloatToVec3GlParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.x = ParamConfig.FLOAT(0);
    this.y = ParamConfig.FLOAT(0);
    this.z = ParamConfig.FLOAT(0);
  }
}
const ParamsConfig3 = new FloatToVec3GlParamsConfig();
const FloatToVec3GlNode2 = class extends TypedGlNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig3;
  }
  static type() {
    return "float_to_vec3";
  }
  initialize_node() {
    this.io.outputs.set_named_output_connection_points([
      new GlConnectionPoint(FloatToVec3GlNode2.OUTPUT_NAME, GlConnectionPointType.VEC3)
    ]);
  }
  set_lines(shaders_collection_controller) {
    const x = this.variable_for_input("x");
    const y = this.variable_for_input("y");
    const z = this.variable_for_input("z");
    const vec = this.gl_var_name(FloatToVec3GlNode2.OUTPUT_NAME);
    const body_line = `vec3 ${vec} = ${ThreeToGl2.float3(x, y, z)}`;
    shaders_collection_controller.add_body_lines(this, [body_line]);
  }
};
export let FloatToVec3GlNode = FloatToVec3GlNode2;
FloatToVec3GlNode.OUTPUT_NAME = "vec3";
class FloatToVec4GlParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.x = ParamConfig.FLOAT(0);
    this.y = ParamConfig.FLOAT(0);
    this.z = ParamConfig.FLOAT(0);
    this.w = ParamConfig.FLOAT(0);
  }
}
const ParamsConfig4 = new FloatToVec4GlParamsConfig();
const FloatToVec4GlNode2 = class extends TypedGlNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig4;
  }
  static type() {
    return "float_to_vec4";
  }
  initialize_node() {
    this.io.outputs.set_named_output_connection_points([
      new GlConnectionPoint(FloatToVec4GlNode2.OUTPUT_NAME, GlConnectionPointType.VEC4)
    ]);
  }
  set_lines(shaders_collection_controller) {
    const x = this.variable_for_input("x");
    const y = this.variable_for_input("y");
    const z = this.variable_for_input("z");
    const w = this.variable_for_input("w");
    const vec = this.gl_var_name(FloatToVec4GlNode2.OUTPUT_NAME);
    const body_line = `vec4 ${vec} = ${ThreeToGl2.float4(x, y, z, w)}`;
    shaders_collection_controller.add_body_lines(this, [body_line]);
  }
};
export let FloatToVec4GlNode = FloatToVec4GlNode2;
FloatToVec4GlNode.OUTPUT_NAME = "vec4";

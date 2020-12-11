import {TypedGlNode} from "./_Base";
import {ParamType as ParamType2} from "../../poly/ParamType";
import {NodeParamsConfig} from "../utils/params/ParamsConfig";
import {GlConnectionPointType, GlConnectionPoint} from "../utils/io/connections/Gl";
class VecToParamsConfig extends NodeParamsConfig {
}
const ParamsConfig2 = new VecToParamsConfig();
class BaseVecToGlNode extends TypedGlNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
}
function VecToGlFactory(type, options) {
  const components = options.components;
  const param_type = options.param_type;
  return class VecToGlNode extends BaseVecToGlNode {
    static type() {
      return type;
    }
    initialize_node() {
      this.io.outputs.set_named_output_connection_points(components.map((c) => {
        return new GlConnectionPoint(c, GlConnectionPointType.FLOAT);
      }));
    }
    create_params() {
      this.add_param(param_type, "vec", components.map((c) => 0));
    }
    set_lines(shaders_collection_controller) {
      const body_lines = [];
      const vec = this.variable_for_input("vec");
      this.io.outputs.used_output_names().forEach((c) => {
        const var_name = this.gl_var_name(c);
        body_lines.push(`float ${var_name} = ${vec}.${c}`);
      });
      shaders_collection_controller.add_body_lines(this, body_lines);
    }
  };
}
const components_v2 = ["x", "y"];
const components_v3 = ["x", "y", "z"];
const components_v4 = ["x", "y", "z", "w"];
export class Vec2ToFloatGlNode extends VecToGlFactory("vec2_to_float", {
  components: ["x", "y"],
  param_type: ParamType2.VECTOR2
}) {
}
export class Vec3ToFloatGlNode extends VecToGlFactory("vec3_to_float", {
  components: ["x", "y", "z"],
  param_type: ParamType2.VECTOR3
}) {
}
export class Vec4ToFloatGlNode extends VecToGlFactory("vec4_to_float", {
  components: components_v4,
  param_type: ParamType2.VECTOR4
}) {
}
const Vec4ToVec3GlNode2 = class extends BaseVecToGlNode {
  static type() {
    return "vec4_to_vec3";
  }
  initialize_node() {
    this.io.outputs.set_named_output_connection_points([
      new GlConnectionPoint(Vec4ToVec3GlNode2.OUTPUT_NAME_VEC3, GlConnectionPointType.VEC3),
      new GlConnectionPoint(Vec4ToVec3GlNode2.OUTPUT_NAME_W, GlConnectionPointType.FLOAT)
    ]);
  }
  create_params() {
    this.add_param(ParamType2.VECTOR4, Vec4ToVec3GlNode2.INPUT_NAME_VEC4, components_v4.map((c) => 0));
  }
  set_lines(shaders_collection_controller) {
    const body_lines = [];
    const in_vec4 = Vec4ToVec3GlNode2.INPUT_NAME_VEC4;
    const out_vec3 = Vec4ToVec3GlNode2.OUTPUT_NAME_VEC3;
    const out_w = Vec4ToVec3GlNode2.OUTPUT_NAME_W;
    const vec = this.variable_for_input(in_vec4);
    const used_output_names = this.io.outputs.used_output_names();
    if (used_output_names.indexOf(out_vec3) >= 0) {
      const var_name = this.gl_var_name(out_vec3);
      body_lines.push(`vec3 ${var_name} = ${vec}.xyz`);
    }
    if (used_output_names.indexOf(out_w) >= 0) {
      const var_name = this.gl_var_name(out_w);
      body_lines.push(`float ${var_name} = ${vec}.w`);
    }
    shaders_collection_controller.add_body_lines(this, body_lines);
  }
};
export let Vec4ToVec3GlNode = Vec4ToVec3GlNode2;
Vec4ToVec3GlNode.INPUT_NAME_VEC4 = "vec4";
Vec4ToVec3GlNode.OUTPUT_NAME_VEC3 = "vec3";
Vec4ToVec3GlNode.OUTPUT_NAME_W = "w";
const Vec3ToVec2GlNode2 = class extends BaseVecToGlNode {
  static type() {
    return "vec3_to_vec2";
  }
  initialize_node() {
    this.io.outputs.set_named_output_connection_points([
      new GlConnectionPoint(Vec3ToVec2GlNode2.OUTPUT_NAME_VEC2, GlConnectionPointType.VEC2),
      new GlConnectionPoint(Vec3ToVec2GlNode2.OUTPUT_NAME_Z, GlConnectionPointType.FLOAT)
    ]);
  }
  create_params() {
    this.add_param(ParamType2.VECTOR3, Vec3ToVec2GlNode2.INPUT_NAME_VEC3, components_v3.map((c) => 0));
  }
  set_lines(shaders_collection_controller) {
    const body_lines = [];
    const in_vec3 = Vec3ToVec2GlNode2.INPUT_NAME_VEC3;
    const out_vec2 = Vec3ToVec2GlNode2.OUTPUT_NAME_VEC2;
    const out_z = Vec3ToVec2GlNode2.OUTPUT_NAME_Z;
    const vec = this.variable_for_input(in_vec3);
    const used_output_names = this.io.outputs.used_output_names();
    if (used_output_names.indexOf(out_vec2) >= 0) {
      const var_name = this.gl_var_name(out_vec2);
      body_lines.push(`vec2 ${var_name} = ${vec}.xy`);
    }
    if (used_output_names.indexOf(out_z) >= 0) {
      const var_name = this.gl_var_name(out_z);
      body_lines.push(`float ${var_name} = ${vec}.z`);
    }
    shaders_collection_controller.add_body_lines(this, body_lines);
  }
};
export let Vec3ToVec2GlNode = Vec3ToVec2GlNode2;
Vec3ToVec2GlNode.INPUT_NAME_VEC3 = "vec3";
Vec3ToVec2GlNode.OUTPUT_NAME_VEC2 = "vec2";
Vec3ToVec2GlNode.OUTPUT_NAME_Z = "z";
const Vec2ToVec3GlNode2 = class extends BaseVecToGlNode {
  static type() {
    return "vec2_to_vec3";
  }
  initialize_node() {
    this.io.outputs.set_named_output_connection_points([
      new GlConnectionPoint(Vec2ToVec3GlNode2.OUTPUT_NAME_VEC3, GlConnectionPointType.VEC3)
    ]);
  }
  create_params() {
    this.add_param(ParamType2.VECTOR2, Vec2ToVec3GlNode2.INPUT_NAME_VEC2, components_v2.map((c) => 0));
    this.add_param(ParamType2.FLOAT, Vec2ToVec3GlNode2.INPUT_NAME_Z, 0);
  }
  set_lines(shaders_collection_controller) {
    const body_lines = [];
    const in_vec2 = Vec2ToVec3GlNode2.INPUT_NAME_VEC2;
    const in_z = Vec2ToVec3GlNode2.INPUT_NAME_Z;
    const out_vec3 = Vec2ToVec3GlNode2.OUTPUT_NAME_VEC3;
    const vec2 = this.variable_for_input(in_vec2);
    const z = this.variable_for_input(in_z);
    const var_name = this.gl_var_name(out_vec3);
    body_lines.push(`vec3 ${var_name} = vec3(${vec2}.xy, ${z})`);
    shaders_collection_controller.add_body_lines(this, body_lines);
  }
};
export let Vec2ToVec3GlNode = Vec2ToVec3GlNode2;
Vec2ToVec3GlNode.INPUT_NAME_VEC2 = "vec3";
Vec2ToVec3GlNode.INPUT_NAME_Z = "z";
Vec2ToVec3GlNode.OUTPUT_NAME_VEC3 = "vec3";
const Vec3ToVec4GlNode2 = class extends BaseVecToGlNode {
  static type() {
    return "vec3_to_vec4";
  }
  initialize_node() {
    this.io.outputs.set_named_output_connection_points([
      new GlConnectionPoint(Vec3ToVec4GlNode2.OUTPUT_NAME_VEC4, GlConnectionPointType.VEC4)
    ]);
  }
  create_params() {
    this.add_param(ParamType2.VECTOR3, Vec3ToVec4GlNode2.INPUT_NAME_VEC3, components_v3.map((c) => 0));
    this.add_param(ParamType2.FLOAT, Vec3ToVec4GlNode2.INPUT_NAME_W, 0);
  }
  set_lines(shaders_collection_controller) {
    const body_lines = [];
    const in_vec3 = Vec3ToVec4GlNode2.INPUT_NAME_VEC3;
    const in_w = Vec3ToVec4GlNode2.INPUT_NAME_W;
    const out_vec4 = Vec3ToVec4GlNode2.OUTPUT_NAME_VEC4;
    const vec3 = this.variable_for_input(in_vec3);
    const w = this.variable_for_input(in_w);
    const var_name = this.gl_var_name(out_vec4);
    body_lines.push(`vec4 ${var_name} = vec4(${vec3}.xyz, ${w})`);
    shaders_collection_controller.add_body_lines(this, body_lines);
  }
};
export let Vec3ToVec4GlNode = Vec3ToVec4GlNode2;
Vec3ToVec4GlNode.INPUT_NAME_VEC3 = "vec3";
Vec3ToVec4GlNode.INPUT_NAME_W = "w";
Vec3ToVec4GlNode.OUTPUT_NAME_VEC4 = "vec4";

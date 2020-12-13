import {UniformsUtils as UniformsUtils2} from "three/src/renderers/shaders/UniformsUtils";
import {ShaderMaterial as ShaderMaterial2} from "three/src/materials/ShaderMaterial";
import {ShaderLib as ShaderLib2} from "three/src/renderers/shaders/ShaderLib";
import {ShaderAssemblerMaterial, CustomMaterialName} from "./_BaseMaterial";
import {ShaderConfig as ShaderConfig2} from "../../configs/ShaderConfig";
import {VariableConfig as VariableConfig2} from "../../configs/VariableConfig";
import {GlobalsGeometryHandler} from "../../globals/Geometry";
import {ShaderAssemblerCustomLineDepthDOF} from "./CustomLineDepthDOF";
import {ShaderName as ShaderName2} from "../../../../utils/shaders/ShaderName";
import {GlConnectionPointType, GlConnectionPoint} from "../../../../utils/io/connections/Gl";
const ASSEMBLER_MAP = new Map([]);
ASSEMBLER_MAP.set(CustomMaterialName.DEPTH_DOF, ShaderAssemblerCustomLineDepthDOF);
const LINES_TO_REMOVE_MAP = new Map([
  [ShaderName2.VERTEX, ["#include <begin_vertex>", "vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );"]],
  [ShaderName2.FRAGMENT, []]
]);
export class ShaderAssemblerLine extends ShaderAssemblerMaterial {
  get _template_shader() {
    const template = ShaderLib2.dashed;
    return {
      vertexShader: template.vertexShader,
      fragmentShader: template.fragmentShader,
      uniforms: template.uniforms
    };
  }
  create_material() {
    const template_shader = this._template_shader;
    return new ShaderMaterial2({
      depthTest: true,
      alphaTest: 0.5,
      linewidth: 100,
      uniforms: UniformsUtils2.clone(template_shader.uniforms),
      vertexShader: template_shader.vertexShader,
      fragmentShader: template_shader.fragmentShader
    });
  }
  custom_assembler_class_by_custom_name() {
    return ASSEMBLER_MAP;
  }
  create_shader_configs() {
    return [
      new ShaderConfig2(ShaderName2.VERTEX, ["position", "uv"], []),
      new ShaderConfig2(ShaderName2.FRAGMENT, ["color", "alpha"], [ShaderName2.VERTEX])
    ];
  }
  static output_input_connection_points() {
    return [
      new GlConnectionPoint("position", GlConnectionPointType.VEC3),
      new GlConnectionPoint("color", GlConnectionPointType.VEC3),
      new GlConnectionPoint("alpha", GlConnectionPointType.FLOAT),
      new GlConnectionPoint("uv", GlConnectionPointType.VEC2)
    ];
  }
  add_output_inputs(output_child) {
    output_child.io.inputs.set_named_input_connection_points(ShaderAssemblerLine.output_input_connection_points());
  }
  static create_globals_node_output_connections() {
    return [
      new GlConnectionPoint("position", GlConnectionPointType.VEC3),
      new GlConnectionPoint("color", GlConnectionPointType.VEC3),
      new GlConnectionPoint("uv", GlConnectionPointType.VEC2),
      new GlConnectionPoint("gl_FragCoord", GlConnectionPointType.VEC4),
      new GlConnectionPoint("resolution", GlConnectionPointType.VEC2),
      new GlConnectionPoint("time", GlConnectionPointType.FLOAT)
    ];
  }
  create_globals_node_output_connections() {
    return ShaderAssemblerLine.create_globals_node_output_connections();
  }
  create_variable_configs() {
    return [
      new VariableConfig2("position", {
        default: "vec3( position )",
        prefix: "vec3 transformed = ",
        suffix: ";vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 )"
      }),
      new VariableConfig2("color", {
        prefix: "diffuseColor.xyz = "
      }),
      new VariableConfig2("alpha", {
        prefix: "diffuseColor.w = "
      }),
      new VariableConfig2("uv", {
        prefix: "vUv = ",
        if: GlobalsGeometryHandler.IF_RULE.uv
      })
    ];
  }
  lines_to_remove(shader_name) {
    return LINES_TO_REMOVE_MAP.get(shader_name);
  }
}

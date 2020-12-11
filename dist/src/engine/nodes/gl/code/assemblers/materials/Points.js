import {UniformsUtils as UniformsUtils2} from "three/src/renderers/shaders/UniformsUtils";
import {ShaderMaterial as ShaderMaterial2} from "three/src/materials/ShaderMaterial";
import {ShaderLib as ShaderLib2} from "three/src/renderers/shaders/ShaderLib";
import {ShaderAssemblerMaterial, CustomMaterialName, GlobalsOutput} from "./_BaseMaterial";
import {ShaderConfig as ShaderConfig2} from "../../configs/ShaderConfig";
import {VariableConfig as VariableConfig2} from "../../configs/VariableConfig";
import {BaseGlShaderAssembler} from "../_Base";
import "./CustomPointsDepth";
import {ShaderAssemblerCustomPointsDistance} from "./CustomPointsDistance";
import {ShaderAssemblerCustomPointsDepthDOF} from "./CustomPointsDepthDOF";
import {GlConnectionPointType, GlConnectionPoint} from "../../../../utils/io/connections/Gl";
import {ShaderName as ShaderName2} from "../../../../utils/shaders/ShaderName";
const LINES_TO_REMOVE_MAP = new Map([
  [ShaderName2.VERTEX, ["#include <begin_vertex>", "gl_PointSize = size;"]],
  [ShaderName2.FRAGMENT, []]
]);
const CUSTOM_ASSEMBLER_MAP = new Map();
CUSTOM_ASSEMBLER_MAP.set(CustomMaterialName.DISTANCE, ShaderAssemblerCustomPointsDistance);
CUSTOM_ASSEMBLER_MAP.set(CustomMaterialName.DEPTH_DOF, ShaderAssemblerCustomPointsDepthDOF);
if (false) {
  CUSTOM_ASSEMBLER_MAP.set(CustomMaterialName.DEPTH, ShaderAssemblerCustomPointsDepth);
}
export class ShaderAssemblerPoints extends ShaderAssemblerMaterial {
  custom_assembler_class_by_custom_name() {
    return CUSTOM_ASSEMBLER_MAP;
  }
  get _template_shader() {
    const template = ShaderLib2.points;
    return {
      vertexShader: template.vertexShader,
      fragmentShader: template.fragmentShader,
      uniforms: template.uniforms
    };
  }
  create_material() {
    const template_shader = this._template_shader;
    const material = new ShaderMaterial2({
      transparent: true,
      fog: true,
      defines: {
        USE_SIZEATTENUATION: 1
      },
      uniforms: UniformsUtils2.clone(template_shader.uniforms),
      vertexShader: template_shader.vertexShader,
      fragmentShader: template_shader.fragmentShader
    });
    this._add_custom_materials(material);
    return material;
  }
  add_output_inputs(output_child) {
    const list = BaseGlShaderAssembler.output_input_connection_points();
    list.push(new GlConnectionPoint("gl_PointSize", GlConnectionPointType.FLOAT));
    output_child.io.inputs.set_named_input_connection_points(list);
  }
  create_globals_node_output_connections() {
    return BaseGlShaderAssembler.create_globals_node_output_connections().concat([
      new GlConnectionPoint(GlobalsOutput.GL_POINTCOORD, GlConnectionPointType.VEC2)
    ]);
  }
  create_shader_configs() {
    return [
      new ShaderConfig2(ShaderName2.VERTEX, ["position", "normal", "uv", "gl_PointSize"], []),
      new ShaderConfig2(ShaderName2.FRAGMENT, ["color", "alpha"], [ShaderName2.VERTEX])
    ];
  }
  create_variable_configs() {
    return BaseGlShaderAssembler.create_variable_configs().concat([
      new VariableConfig2("gl_PointSize", {
        default: "1.0",
        prefix: "gl_PointSize = ",
        suffix: " * size * 10.0"
      })
    ]);
  }
  lines_to_remove(shader_name) {
    return LINES_TO_REMOVE_MAP.get(shader_name);
  }
}

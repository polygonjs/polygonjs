import {UniformsUtils as UniformsUtils2} from "three/src/renderers/shaders/UniformsUtils";
import {ShaderMaterial as ShaderMaterial2} from "three/src/materials/ShaderMaterial";
import {ShaderLib as ShaderLib2} from "three/src/renderers/shaders/ShaderLib";
import {ShaderAssemblerMesh} from "./_BaseMesh";
import {BaseGlShaderAssembler} from "../_Base";
import {ShaderConfig as ShaderConfig2} from "../../configs/ShaderConfig";
import {VariableConfig as VariableConfig2} from "../../configs/VariableConfig";
import metalnessmap_fragment2 from "../../../gl/ShaderLib/ShaderChunk/metalnessmap_fragment.glsl";
import roughnessmap_fragment2 from "../../../gl/ShaderLib/ShaderChunk/roughnessmap_fragment.glsl";
import {ShaderName as ShaderName2} from "../../../../utils/shaders/ShaderName";
import {GlConnectionPoint, GlConnectionPointType} from "../../../../utils/io/connections/Gl";
export class ShaderAssemblerStandard extends ShaderAssemblerMesh {
  is_physical() {
    return false;
  }
  get _template_shader() {
    const template = this.is_physical() ? ShaderLib2.physical : ShaderLib2.standard;
    return {
      vertexShader: template.vertexShader,
      fragmentShader: template.fragmentShader,
      uniforms: template.uniforms
    };
  }
  create_material() {
    const template_shader = this._template_shader;
    const options = {
      lights: true,
      extensions: {
        derivatives: true
      },
      uniforms: UniformsUtils2.clone(template_shader.uniforms),
      vertexShader: template_shader.vertexShader,
      fragmentShader: template_shader.fragmentShader
    };
    const material = new ShaderMaterial2(options);
    material.onBeforeCompile = function(shader) {
      shader.fragmentShader = shader.fragmentShader.replace("#include <metalnessmap_fragment>", metalnessmap_fragment2);
      shader.fragmentShader = shader.fragmentShader.replace("#include <roughnessmap_fragment>", roughnessmap_fragment2);
    };
    this._add_custom_materials(material);
    return material;
  }
  add_output_inputs(output_child) {
    const list = BaseGlShaderAssembler.output_input_connection_points();
    list.push(new GlConnectionPoint("metalness", GlConnectionPointType.FLOAT, 1));
    list.push(new GlConnectionPoint("roughness", GlConnectionPointType.FLOAT, 1));
    output_child.io.inputs.set_named_input_connection_points(list);
  }
  create_shader_configs() {
    return [
      new ShaderConfig2(ShaderName2.VERTEX, ["position", "normal", "uv"], []),
      new ShaderConfig2(ShaderName2.FRAGMENT, ["color", "alpha", "metalness", "roughness"], [ShaderName2.VERTEX])
    ];
  }
  create_variable_configs() {
    return BaseGlShaderAssembler.create_variable_configs().concat([
      new VariableConfig2("metalness", {
        default: "1.0",
        prefix: "float POLY_metalness = "
      }),
      new VariableConfig2("roughness", {
        default: "1.0",
        prefix: "float POLY_roughness = "
      })
    ]);
  }
}

import {UniformsUtils as UniformsUtils2} from "three/src/renderers/shaders/UniformsUtils";
import {ShaderMaterial as ShaderMaterial2} from "three/src/materials/ShaderMaterial";
import {ShaderLib as ShaderLib2} from "three/src/renderers/shaders/ShaderLib";
import {RGBADepthPacking} from "three/src/constants";
import {BasicDepthPacking} from "three/src/constants";
import {ShaderAssemblerMaterial} from "./_BaseMaterial";
import TemplateVertex from "../../templates/CustomPointsDistance.vert.glsl";
import {ShaderName as ShaderName2} from "../../../../utils/shaders/ShaderName";
const INSERT_DEFINE_AFTER_MAP = new Map([[ShaderName2.VERTEX, "// INSERT DEFINES"]]);
const INSERT_BODY_AFTER_MAP = new Map([[ShaderName2.VERTEX, "// INSERT BODY"]]);
export class ShaderAssemblerCustomPointsDistance extends ShaderAssemblerMaterial {
  get _template_shader() {
    const template = ShaderLib2.distanceRGBA;
    const uniforms = UniformsUtils2.clone(template.uniforms);
    uniforms["size"] = {value: 1};
    uniforms["scale"] = {value: 1};
    return {
      vertexShader: TemplateVertex,
      fragmentShader: template.fragmentShader,
      uniforms
    };
  }
  insert_define_after(shader_name) {
    return INSERT_DEFINE_AFTER_MAP.get(shader_name);
  }
  insert_body_after(shader_name) {
    return INSERT_BODY_AFTER_MAP.get(shader_name);
  }
  create_material() {
    const template_shader = this._template_shader;
    return new ShaderMaterial2({
      defines: {
        USE_SIZEATTENUATION: 1,
        DEPTH_PACKING: [RGBADepthPacking, BasicDepthPacking][0]
      },
      uniforms: UniformsUtils2.clone(template_shader.uniforms),
      vertexShader: template_shader.vertexShader,
      fragmentShader: template_shader.fragmentShader
    });
  }
}

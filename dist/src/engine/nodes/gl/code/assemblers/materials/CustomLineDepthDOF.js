import {UniformsUtils as UniformsUtils2} from "three/src/renderers/shaders/UniformsUtils";
import {ShaderMaterial as ShaderMaterial2} from "three/src/materials/ShaderMaterial";
import {ShaderAssemblerMaterial} from "./_BaseMaterial";
import TemplateVertex from "../templates/CustomLineDepthDOF.vert.glsl";
import TemplateFragment from "../templates/CustomMeshDepthDOF.frag.glsl";
import {ShaderName as ShaderName2} from "../../../../utils/shaders/ShaderName";
const INSERT_DEFINE_AFTER_MAP = new Map([[ShaderName2.VERTEX, "// INSERT DEFINES"]]);
const INSERT_BODY_AFTER_MAP = new Map([[ShaderName2.VERTEX, "// INSERT BODY"]]);
export class ShaderAssemblerCustomLineDepthDOF extends ShaderAssemblerMaterial {
  get _template_shader() {
    return {
      vertexShader: TemplateVertex,
      fragmentShader: TemplateFragment,
      uniforms: {
        scale: {value: 1},
        mNear: {value: 0},
        mFar: {value: 10}
      }
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
      depthTest: true,
      linewidth: 100,
      uniforms: UniformsUtils2.clone(template_shader.uniforms),
      vertexShader: template_shader.vertexShader,
      fragmentShader: template_shader.fragmentShader
    });
  }
}

import {UniformsUtils as UniformsUtils2} from "three/src/renderers/shaders/UniformsUtils";
import {ShaderMaterial as ShaderMaterial2} from "three/src/materials/ShaderMaterial";
import {ShaderLib as ShaderLib2} from "three/src/renderers/shaders/ShaderLib";
import {ShaderAssemblerMesh} from "./_BaseMesh";
export class ShaderAssemblerLambert extends ShaderAssemblerMesh {
  get _template_shader() {
    const template = ShaderLib2.lambert;
    return {
      vertexShader: template.vertexShader,
      fragmentShader: template.fragmentShader,
      uniforms: template.uniforms
    };
  }
  create_material() {
    const template_shader = this._template_shader;
    const material = new ShaderMaterial2({
      lights: true,
      uniforms: UniformsUtils2.clone(template_shader.uniforms),
      vertexShader: template_shader.vertexShader,
      fragmentShader: template_shader.fragmentShader
    });
    this._add_custom_materials(material);
    return material;
  }
}

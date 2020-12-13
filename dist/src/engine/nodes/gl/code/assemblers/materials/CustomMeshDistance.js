import {UniformsUtils as UniformsUtils2} from "three/src/renderers/shaders/UniformsUtils";
import {ShaderMaterial as ShaderMaterial2} from "three/src/materials/ShaderMaterial";
import {ShaderLib as ShaderLib2} from "three/src/renderers/shaders/ShaderLib";
import {RGBADepthPacking} from "three/src/constants";
import {BasicDepthPacking} from "three/src/constants";
import {ShaderAssemblerMaterial} from "./_BaseMaterial";
import {ShaderName as ShaderName2} from "../../../../utils/shaders/ShaderName";
const INSERT_BODY_AFTER_MAP = new Map([
  [ShaderName2.VERTEX, "#include <begin_vertex>"],
  [ShaderName2.FRAGMENT, "vec4 diffuseColor = vec4( 1.0 );"]
]);
export class ShaderAssemblerCustomMeshDistance extends ShaderAssemblerMaterial {
  get _template_shader() {
    const template = ShaderLib2.distanceRGBA;
    return {
      vertexShader: template.vertexShader,
      fragmentShader: template.fragmentShader,
      uniforms: template.uniforms
    };
  }
  insert_body_after(shader_name) {
    return INSERT_BODY_AFTER_MAP.get(shader_name);
  }
  create_material() {
    const template_shader = this._template_shader;
    return new ShaderMaterial2({
      defines: {
        DEPTH_PACKING: [RGBADepthPacking, BasicDepthPacking][0]
      },
      uniforms: UniformsUtils2.clone(template_shader.uniforms),
      vertexShader: template_shader.vertexShader,
      fragmentShader: template_shader.fragmentShader
    });
  }
}

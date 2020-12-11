import {ShaderMaterial as ShaderMaterial2} from "three/src/materials/ShaderMaterial";
import {UniformsUtils as UniformsUtils2} from "three/src/renderers/shaders/UniformsUtils";
import {Pass as Pass2} from "../postprocessing/Pass.js";
var ShaderPass = function(shader, textureID) {
  Pass2.call(this);
  this.textureID = textureID !== void 0 ? textureID : "tDiffuse";
  if (shader instanceof ShaderMaterial2) {
    this.uniforms = shader.uniforms;
    this.material = shader;
  } else if (shader) {
    this.uniforms = UniformsUtils2.clone(shader.uniforms);
    this.material = new ShaderMaterial2({
      defines: Object.assign({}, shader.defines),
      uniforms: this.uniforms,
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader
    });
  }
  this.fsQuad = new Pass2.FullScreenQuad(this.material);
};
ShaderPass.prototype = Object.assign(Object.create(Pass2.prototype), {
  constructor: ShaderPass,
  render: function(renderer, writeBuffer, readBuffer) {
    if (this.uniforms[this.textureID]) {
      this.uniforms[this.textureID].value = readBuffer.texture;
    }
    this.fsQuad.material = this.material;
    if (this.renderToScreen) {
      renderer.setRenderTarget(null);
      this.fsQuad.render(renderer);
    } else {
      renderer.setRenderTarget(writeBuffer);
      if (this.clear)
        renderer.clear(renderer.autoClearColor, renderer.autoClearDepth, renderer.autoClearStencil);
      this.fsQuad.render(renderer);
    }
  }
});
export {ShaderPass};

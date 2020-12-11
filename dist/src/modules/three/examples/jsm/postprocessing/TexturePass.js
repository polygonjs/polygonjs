import {ShaderMaterial as ShaderMaterial2} from "three/src/materials/ShaderMaterial";
import {UniformsUtils as UniformsUtils2} from "three/src/renderers/shaders/UniformsUtils";
import {Pass as Pass2} from "../postprocessing/Pass.js";
import {CopyShader as CopyShader2} from "../shaders/CopyShader.js";
var TexturePass = function(map, opacity) {
  Pass2.call(this);
  if (CopyShader2 === void 0)
    console.error("TexturePass relies on CopyShader");
  var shader = CopyShader2;
  this.map = map;
  this.opacity = opacity !== void 0 ? opacity : 1;
  this.uniforms = UniformsUtils2.clone(shader.uniforms);
  this.material = new ShaderMaterial2({
    uniforms: this.uniforms,
    vertexShader: shader.vertexShader,
    fragmentShader: shader.fragmentShader,
    depthTest: false,
    depthWrite: false
  });
  this.needsSwap = false;
  this.fsQuad = new Pass2.FullScreenQuad(null);
};
TexturePass.prototype = Object.assign(Object.create(Pass2.prototype), {
  constructor: TexturePass,
  render: function(renderer, writeBuffer, readBuffer) {
    var oldAutoClear = renderer.autoClear;
    renderer.autoClear = false;
    this.fsQuad.material = this.material;
    this.uniforms["opacity"].value = this.opacity;
    this.uniforms["tDiffuse"].value = this.map;
    this.material.transparent = this.opacity < 1;
    renderer.setRenderTarget(this.renderToScreen ? null : readBuffer);
    if (this.clear)
      renderer.clear();
    this.fsQuad.render(renderer);
    renderer.autoClear = oldAutoClear;
  }
});
export {TexturePass};

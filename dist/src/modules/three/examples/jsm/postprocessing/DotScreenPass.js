import {ShaderMaterial as ShaderMaterial2} from "three/src/materials/ShaderMaterial";
import {UniformsUtils as UniformsUtils2} from "three/src/renderers/shaders/UniformsUtils";
import {Pass as Pass2} from "../postprocessing/Pass.js";
import {DotScreenShader as DotScreenShader2} from "../shaders/DotScreenShader.js";
var DotScreenPass = function(center, angle, scale) {
  Pass2.call(this);
  if (DotScreenShader2 === void 0)
    console.error("DotScreenPass relies on DotScreenShader");
  var shader = DotScreenShader2;
  this.uniforms = UniformsUtils2.clone(shader.uniforms);
  if (center !== void 0)
    this.uniforms["center"].value.copy(center);
  if (angle !== void 0)
    this.uniforms["angle"].value = angle;
  if (scale !== void 0)
    this.uniforms["scale"].value = scale;
  this.material = new ShaderMaterial2({
    uniforms: this.uniforms,
    vertexShader: shader.vertexShader,
    fragmentShader: shader.fragmentShader
  });
  this.fsQuad = new Pass2.FullScreenQuad(this.material);
};
DotScreenPass.prototype = Object.assign(Object.create(Pass2.prototype), {
  constructor: DotScreenPass,
  render: function(renderer, writeBuffer, readBuffer) {
    this.uniforms["tDiffuse"].value = readBuffer.texture;
    this.uniforms["tSize"].value.set(readBuffer.width, readBuffer.height);
    if (this.renderToScreen) {
      renderer.setRenderTarget(null);
      this.fsQuad.render(renderer);
    } else {
      renderer.setRenderTarget(writeBuffer);
      if (this.clear)
        renderer.clear();
      this.fsQuad.render(renderer);
    }
  }
});
export {DotScreenPass};

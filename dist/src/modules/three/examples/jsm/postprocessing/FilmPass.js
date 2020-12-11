import {ShaderMaterial as ShaderMaterial2} from "three/src/materials/ShaderMaterial";
import {UniformsUtils as UniformsUtils2} from "three/src/renderers/shaders/UniformsUtils";
import {Pass as Pass2} from "../postprocessing/Pass.js";
import {FilmShader as FilmShader2} from "../shaders/FilmShader.js";
var FilmPass = function(noiseIntensity, scanlinesIntensity, scanlinesCount, grayscale) {
  Pass2.call(this);
  if (FilmShader2 === void 0)
    console.error("FilmPass relies on FilmShader");
  var shader = FilmShader2;
  this.uniforms = UniformsUtils2.clone(shader.uniforms);
  this.material = new ShaderMaterial2({
    uniforms: this.uniforms,
    vertexShader: shader.vertexShader,
    fragmentShader: shader.fragmentShader
  });
  if (grayscale !== void 0)
    this.uniforms.grayscale.value = grayscale;
  if (noiseIntensity !== void 0)
    this.uniforms.nIntensity.value = noiseIntensity;
  if (scanlinesIntensity !== void 0)
    this.uniforms.sIntensity.value = scanlinesIntensity;
  if (scanlinesCount !== void 0)
    this.uniforms.sCount.value = scanlinesCount;
  this.fsQuad = new Pass2.FullScreenQuad(this.material);
};
FilmPass.prototype = Object.assign(Object.create(Pass2.prototype), {
  constructor: FilmPass,
  render: function(renderer, writeBuffer, readBuffer, deltaTime) {
    this.uniforms["tDiffuse"].value = readBuffer.texture;
    this.uniforms["time"].value += deltaTime;
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
export {FilmPass};

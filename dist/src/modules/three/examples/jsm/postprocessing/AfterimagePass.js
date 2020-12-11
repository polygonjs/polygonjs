import {LinearFilter} from "three/src/constants";
import {MeshBasicMaterial as MeshBasicMaterial2} from "three/src/materials/MeshBasicMaterial";
import {NearestFilter} from "three/src/constants";
import {RGBAFormat} from "three/src/constants";
import {ShaderMaterial as ShaderMaterial2} from "three/src/materials/ShaderMaterial";
import {UniformsUtils as UniformsUtils2} from "three/src/renderers/shaders/UniformsUtils";
import {WebGLRenderTarget as WebGLRenderTarget2} from "three/src/renderers/WebGLRenderTarget";
import {Pass as Pass2} from "../postprocessing/Pass.js";
import {AfterimageShader as AfterimageShader2} from "../shaders/AfterimageShader.js";
var AfterimagePass = function(damp) {
  Pass2.call(this);
  if (AfterimageShader2 === void 0)
    console.error("AfterimagePass relies on AfterimageShader");
  this.shader = AfterimageShader2;
  this.uniforms = UniformsUtils2.clone(this.shader.uniforms);
  this.uniforms["damp"].value = damp !== void 0 ? damp : 0.96;
  this.textureComp = new WebGLRenderTarget2(window.innerWidth, window.innerHeight, {
    minFilter: LinearFilter,
    magFilter: NearestFilter,
    format: RGBAFormat
  });
  this.textureOld = new WebGLRenderTarget2(window.innerWidth, window.innerHeight, {
    minFilter: LinearFilter,
    magFilter: NearestFilter,
    format: RGBAFormat
  });
  this.shaderMaterial = new ShaderMaterial2({
    uniforms: this.uniforms,
    vertexShader: this.shader.vertexShader,
    fragmentShader: this.shader.fragmentShader
  });
  this.compFsQuad = new Pass2.FullScreenQuad(this.shaderMaterial);
  var material = new MeshBasicMaterial2();
  this.copyFsQuad = new Pass2.FullScreenQuad(material);
};
AfterimagePass.prototype = Object.assign(Object.create(Pass2.prototype), {
  constructor: AfterimagePass,
  render: function(renderer, writeBuffer, readBuffer) {
    this.uniforms["tOld"].value = this.textureOld.texture;
    this.uniforms["tNew"].value = readBuffer.texture;
    renderer.setRenderTarget(this.textureComp);
    this.compFsQuad.render(renderer);
    this.copyFsQuad.material.map = this.textureComp.texture;
    if (this.renderToScreen) {
      renderer.setRenderTarget(null);
      this.copyFsQuad.render(renderer);
    } else {
      renderer.setRenderTarget(writeBuffer);
      if (this.clear)
        renderer.clear();
      this.copyFsQuad.render(renderer);
    }
    var temp = this.textureOld;
    this.textureOld = this.textureComp;
    this.textureComp = temp;
  },
  setSize: function(width, height) {
    this.textureComp.setSize(width, height);
    this.textureOld.setSize(width, height);
  }
});
export {AfterimagePass};

import {AdditiveBlending} from "three/src/constants";
import {LinearFilter} from "three/src/constants";
import {RGBAFormat} from "three/src/constants";
import {ShaderMaterial as ShaderMaterial2} from "three/src/materials/ShaderMaterial";
import {UniformsUtils as UniformsUtils2} from "three/src/renderers/shaders/UniformsUtils";
import {Vector2 as Vector22} from "three/src/math/Vector2";
import {WebGLRenderTarget as WebGLRenderTarget2} from "three/src/renderers/WebGLRenderTarget";
import {Pass as Pass2} from "../postprocessing/Pass.js";
import {CopyShader as CopyShader2} from "../shaders/CopyShader.js";
import {ConvolutionShader as ConvolutionShader2} from "../shaders/ConvolutionShader.js";
var BloomPass = function(strength, kernelSize, sigma, resolution) {
  Pass2.call(this);
  strength = strength !== void 0 ? strength : 1;
  kernelSize = kernelSize !== void 0 ? kernelSize : 25;
  sigma = sigma !== void 0 ? sigma : 4;
  resolution = resolution !== void 0 ? resolution : 256;
  var pars = {minFilter: LinearFilter, magFilter: LinearFilter, format: RGBAFormat};
  this.renderTargetX = new WebGLRenderTarget2(resolution, resolution, pars);
  this.renderTargetX.texture.name = "BloomPass.x";
  this.renderTargetY = new WebGLRenderTarget2(resolution, resolution, pars);
  this.renderTargetY.texture.name = "BloomPass.y";
  if (CopyShader2 === void 0)
    console.error("BloomPass relies on CopyShader");
  var copyShader = CopyShader2;
  this.copyUniforms = UniformsUtils2.clone(copyShader.uniforms);
  this.copyUniforms["opacity"].value = strength;
  this.materialCopy = new ShaderMaterial2({
    uniforms: this.copyUniforms,
    vertexShader: copyShader.vertexShader,
    fragmentShader: copyShader.fragmentShader,
    blending: AdditiveBlending,
    transparent: true
  });
  if (ConvolutionShader2 === void 0)
    console.error("BloomPass relies on ConvolutionShader");
  var convolutionShader = ConvolutionShader2;
  this.convolutionUniforms = UniformsUtils2.clone(convolutionShader.uniforms);
  this.convolutionUniforms["uImageIncrement"].value = BloomPass.blurX;
  this.convolutionUniforms["cKernel"].value = ConvolutionShader2.buildKernel(sigma);
  this.materialConvolution = new ShaderMaterial2({
    uniforms: this.convolutionUniforms,
    vertexShader: convolutionShader.vertexShader,
    fragmentShader: convolutionShader.fragmentShader,
    defines: {
      KERNEL_SIZE_FLOAT: kernelSize.toFixed(1),
      KERNEL_SIZE_INT: kernelSize.toFixed(0)
    }
  });
  this.needsSwap = false;
  this.fsQuad = new Pass2.FullScreenQuad(null);
};
BloomPass.prototype = Object.assign(Object.create(Pass2.prototype), {
  constructor: BloomPass,
  render: function(renderer, writeBuffer, readBuffer, deltaTime, maskActive) {
    if (maskActive)
      renderer.state.buffers.stencil.setTest(false);
    this.fsQuad.material = this.materialConvolution;
    this.convolutionUniforms["tDiffuse"].value = readBuffer.texture;
    this.convolutionUniforms["uImageIncrement"].value = BloomPass.blurX;
    renderer.setRenderTarget(this.renderTargetX);
    renderer.clear();
    this.fsQuad.render(renderer);
    this.convolutionUniforms["tDiffuse"].value = this.renderTargetX.texture;
    this.convolutionUniforms["uImageIncrement"].value = BloomPass.blurY;
    renderer.setRenderTarget(this.renderTargetY);
    renderer.clear();
    this.fsQuad.render(renderer);
    this.fsQuad.material = this.materialCopy;
    this.copyUniforms["tDiffuse"].value = this.renderTargetY.texture;
    if (maskActive)
      renderer.state.buffers.stencil.setTest(true);
    renderer.setRenderTarget(readBuffer);
    if (this.clear)
      renderer.clear();
    this.fsQuad.render(renderer);
  }
});
BloomPass.blurX = new Vector22(1953125e-9, 0);
BloomPass.blurY = new Vector22(0, 1953125e-9);
export {BloomPass};

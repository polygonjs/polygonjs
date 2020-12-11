import {Pass as Pass2} from "../postprocessing/Pass.js";
var RenderPass = function(scene, camera, overrideMaterial, clearColor, clearAlpha) {
  Pass2.call(this);
  this.scene = scene;
  this.camera = camera;
  this.overrideMaterial = overrideMaterial;
  this.clearColor = clearColor;
  this.clearAlpha = clearAlpha !== void 0 ? clearAlpha : 0;
  this.clear = true;
  this.clearDepth = false;
  this.needsSwap = false;
};
RenderPass.prototype = Object.assign(Object.create(Pass2.prototype), {
  constructor: RenderPass,
  render: function(renderer, writeBuffer, readBuffer) {
    var oldAutoClear = renderer.autoClear;
    renderer.autoClear = false;
    var oldClearColor, oldClearAlpha, oldOverrideMaterial;
    if (this.overrideMaterial !== void 0) {
      oldOverrideMaterial = this.scene.overrideMaterial;
      this.scene.overrideMaterial = this.overrideMaterial;
    }
    if (this.clearColor) {
      oldClearColor = renderer.getClearColor().getHex();
      oldClearAlpha = renderer.getClearAlpha();
      renderer.setClearColor(this.clearColor, this.clearAlpha);
    }
    if (this.clearDepth) {
      renderer.clearDepth();
    }
    renderer.setRenderTarget(this.renderToScreen ? null : readBuffer);
    if (this.clear)
      renderer.clear(renderer.autoClearColor, renderer.autoClearDepth, renderer.autoClearStencil);
    renderer.render(this.scene, this.camera);
    if (this.clearColor) {
      renderer.setClearColor(oldClearColor, oldClearAlpha);
    }
    if (this.overrideMaterial !== void 0) {
      this.scene.overrideMaterial = oldOverrideMaterial;
    }
    renderer.autoClear = oldAutoClear;
  }
});
export {RenderPass};

import {Pass as Pass2} from "../postprocessing/Pass.js";
var ClearPass = function(clearColor, clearAlpha) {
  Pass2.call(this);
  this.needsSwap = false;
  this.clearColor = clearColor !== void 0 ? clearColor : 0;
  this.clearAlpha = clearAlpha !== void 0 ? clearAlpha : 0;
};
ClearPass.prototype = Object.assign(Object.create(Pass2.prototype), {
  constructor: ClearPass,
  render: function(renderer, writeBuffer, readBuffer) {
    var oldClearColor, oldClearAlpha;
    if (this.clearColor) {
      oldClearColor = renderer.getClearColor().getHex();
      oldClearAlpha = renderer.getClearAlpha();
      renderer.setClearColor(this.clearColor, this.clearAlpha);
    }
    renderer.setRenderTarget(this.renderToScreen ? null : readBuffer);
    renderer.clear();
    if (this.clearColor) {
      renderer.setClearColor(oldClearColor, oldClearAlpha);
    }
  }
});
export {ClearPass};

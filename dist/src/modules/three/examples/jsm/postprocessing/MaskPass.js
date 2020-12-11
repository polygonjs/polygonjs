import {Pass as Pass2} from "../postprocessing/Pass.js";
var MaskPass = function(scene, camera) {
  Pass2.call(this);
  this.scene = scene;
  this.camera = camera;
  this.clear = true;
  this.needsSwap = false;
  this.inverse = false;
};
MaskPass.prototype = Object.assign(Object.create(Pass2.prototype), {
  constructor: MaskPass,
  render: function(renderer, writeBuffer, readBuffer) {
    var context = renderer.getContext();
    var state = renderer.state;
    state.buffers.color.setMask(false);
    state.buffers.depth.setMask(false);
    state.buffers.color.setLocked(true);
    state.buffers.depth.setLocked(true);
    var writeValue, clearValue;
    if (this.inverse) {
      writeValue = 0;
      clearValue = 1;
    } else {
      writeValue = 1;
      clearValue = 0;
    }
    state.buffers.stencil.setTest(true);
    state.buffers.stencil.setOp(context.REPLACE, context.REPLACE, context.REPLACE);
    state.buffers.stencil.setFunc(context.ALWAYS, writeValue, 4294967295);
    state.buffers.stencil.setClear(clearValue);
    state.buffers.stencil.setLocked(true);
    renderer.setRenderTarget(readBuffer);
    if (this.clear)
      renderer.clear();
    renderer.render(this.scene, this.camera);
    renderer.setRenderTarget(writeBuffer);
    if (this.clear)
      renderer.clear();
    renderer.render(this.scene, this.camera);
    state.buffers.color.setLocked(false);
    state.buffers.depth.setLocked(false);
    state.buffers.stencil.setLocked(false);
    state.buffers.stencil.setFunc(context.EQUAL, 1, 4294967295);
    state.buffers.stencil.setOp(context.KEEP, context.KEEP, context.KEEP);
    state.buffers.stencil.setLocked(true);
  }
});
var ClearMaskPass = function() {
  Pass2.call(this);
  this.needsSwap = false;
};
ClearMaskPass.prototype = Object.create(Pass2.prototype);
Object.assign(ClearMaskPass.prototype, {
  render: function(renderer) {
    renderer.state.buffers.stencil.setLocked(false);
    renderer.state.buffers.stencil.setTest(false);
  }
});
export {MaskPass, ClearMaskPass};

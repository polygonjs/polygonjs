export class WebGLController {
  constructor(viewer) {
    this.viewer = viewer;
  }
  init() {
    const canvas = this.viewer.canvas;
    if (canvas) {
      canvas.onwebglcontextlost = this._on_webglcontextlost.bind(this);
      canvas.onwebglcontextrestored = this._on_webglcontextrestored.bind(this);
    }
  }
  _on_webglcontextlost() {
    console.warn("context lost at frame", this.viewer.scene.frame);
    if (this.request_animation_frame_id) {
      cancelAnimationFrame(this.request_animation_frame_id);
    } else {
      console.warn("request_animation_frame_id not initialized");
    }
    console.warn("not canceled", this.request_animation_frame_id);
  }
  _on_webglcontextrestored() {
    console.log("context restored");
  }
}

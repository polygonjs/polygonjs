import {ViewerControlsController} from "./utils/ControlsController";
import {TypedViewer} from "./_Base";
const CSS_CLASS = "CoreThreejsViewer";
export class ThreejsViewer extends TypedViewer {
  constructor(_container, _scene, _camera_node, _properties) {
    super(_container, _scene, _camera_node);
    this._scene = _scene;
    this._camera_node = _camera_node;
    this._properties = _properties;
    this._do_render = true;
    this._animate_method = this.animate.bind(this);
    this._do_render = this._properties != null ? this._properties.auto_render : true;
    this._canvas = document.createElement("canvas");
    this._canvas.id = `canvas_id_${Math.random()}`.replace(".", "_");
    this._canvas.style.display = "block";
    this._canvas.style.outline = "none";
    this._container.appendChild(this._canvas);
    this._container.classList.add(CSS_CLASS);
    this._build();
    this._set_events();
  }
  get controls_controller() {
    return this._controls_controller = this._controls_controller || new ViewerControlsController(this);
  }
  _build() {
    this._init_display();
    this.activate();
  }
  dispose() {
    this._cancel_animate();
    this.controls_controller.dispose();
    super.dispose();
  }
  get camera_controls_controller() {
    return this._camera_node.controls_controller;
  }
  _set_events() {
    this.events_controller.init();
    this.webgl_controller.init();
    window.onresize = () => {
      this.on_resize();
    };
  }
  on_resize() {
    if (!this.canvas) {
      return;
    }
    this.cameras_controller.compute_size_and_aspect();
    this._camera_node.render_controller.set_renderer_size(this.canvas, this.cameras_controller.size);
    this.cameras_controller.update_camera_aspect();
  }
  _init_display() {
    if (!this._canvas) {
      console.warn("no canvas found for viewer");
      return;
    }
    this.cameras_controller.compute_size_and_aspect();
    const size = this.cameras_controller.size;
    this._camera_node.render_controller.create_renderer(this._canvas, size);
    this.cameras_controller.prepare_current_camera();
    this.animate();
  }
  set_auto_render(state = true) {
    this._do_render = state;
    if (this._do_render) {
      this.animate();
    }
  }
  animate() {
    if (this._do_render) {
      this._request_animation_frame_id = requestAnimationFrame(this._animate_method);
      this._scene.time_controller.increment_time_if_playing();
      this.render();
      this._controls_controller?.update();
    }
  }
  _cancel_animate() {
    this._do_render = false;
    if (this._request_animation_frame_id) {
      cancelAnimationFrame(this._request_animation_frame_id);
    }
    if (this._canvas) {
      this._camera_node.render_controller.delete_renderer(this._canvas);
    }
  }
  render() {
    if (this.cameras_controller.camera_node && this._canvas) {
      const size = this.cameras_controller.size;
      const aspect = this.cameras_controller.aspect;
      this._camera_node.render_controller.render(this._canvas, size, aspect);
    } else {
      console.warn("no camera to render with");
    }
  }
  renderer() {
    if (this._canvas) {
      return this._camera_node.render_controller.renderer(this._canvas);
    }
  }
}

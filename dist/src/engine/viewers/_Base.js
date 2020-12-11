import {ViewerCamerasController} from "./utils/CamerasController";
import {ViewerEventsController} from "./utils/EventsController";
import {WebGLController} from "./utils/WebglController";
const HOVERED_CLASS_NAME = "hovered";
const TypedViewer2 = class {
  constructor(_container, _scene, _camera_node) {
    this._container = _container;
    this._scene = _scene;
    this._camera_node = _camera_node;
    this._active = false;
    this._id = TypedViewer2._next_viewer_id++;
    this._scene.viewers_register.register_viewer(this);
  }
  get active() {
    return this._active;
  }
  activate() {
    this._active = true;
  }
  deactivate() {
    this._active = false;
  }
  get cameras_controller() {
    return this._cameras_controller = this._cameras_controller || new ViewerCamerasController(this);
  }
  get controls_controller() {
    return this._controls_controller;
  }
  get events_controller() {
    return this._events_controller = this._events_controller || new ViewerEventsController(this);
  }
  get webgl_controller() {
    return this._webgl_controller = this._webgl_controller || new WebGLController(this);
  }
  get container() {
    return this._container;
  }
  get scene() {
    return this._scene;
  }
  get canvas() {
    return this._canvas;
  }
  get camera_node() {
    return this._camera_node;
  }
  get camera_controls_controller() {
    return void 0;
  }
  get id() {
    return this._id;
  }
  dispose() {
    this._scene.viewers_register.unregister_viewer(this);
    this.events_controller.dispose();
    let child;
    while (child = this._container.children[0]) {
      this._container.removeChild(child);
    }
  }
  reset_container_class() {
    this.container.classList.remove(HOVERED_CLASS_NAME);
  }
  set_container_class_hovered() {
    this.container.classList.add(HOVERED_CLASS_NAME);
  }
};
export let TypedViewer = TypedViewer2;
TypedViewer._next_viewer_id = 0;

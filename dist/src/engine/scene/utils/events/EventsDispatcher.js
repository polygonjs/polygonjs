import {MouseEventNode} from "../../../nodes/event/Mouse";
import {PointerEventNode} from "../../../nodes/event/Pointer";
import {SceneEventNode} from "../../../nodes/event/Scene";
import {KeyboardEventNode} from "../../../nodes/event/Keyboard";
import {SceneEventsController as SceneEventsController2} from "./SceneEventsController";
import {KeyboardEventsController as KeyboardEventsController2} from "./KeyboardEventsController";
import {MouseEventsController as MouseEventsController2} from "./MouseEventsController";
import {PointerEventsController as PointerEventsController2} from "./PointerEventsController";
export class SceneEventsDispatcher {
  constructor(scene) {
    this.scene = scene;
    this._controllers = [];
  }
  register_event_node(node) {
    const controller = this._find_or_create_controller_for_node(node);
    if (controller) {
      controller.register_node(node);
    }
  }
  unregister_event_node(node) {
    const controller = this._find_or_create_controller_for_node(node);
    if (controller) {
      controller.unregister_node(node);
    }
  }
  update_viewer_event_listeners(node) {
    const controller = this._find_or_create_controller_for_node(node);
    if (controller) {
      controller.update_viewer_event_listeners();
    }
  }
  traverse_controllers(callback) {
    for (let controller of this._controllers) {
      callback(controller);
    }
  }
  _find_or_create_controller_for_node(node) {
    switch (node.type) {
      case KeyboardEventNode.type():
        return this.keyboard_events_controller;
      case MouseEventNode.type():
        return this.mouse_events_controller;
      case PointerEventNode.type():
        return this.pointer_events_controller;
      case SceneEventNode.type():
        return this.scene_events_controller;
    }
  }
  get keyboard_events_controller() {
    return this._keyboard_events_controller = this._keyboard_events_controller || this._create_controller(KeyboardEventsController2);
  }
  get mouse_events_controller() {
    return this._mouse_events_controller = this._mouse_events_controller || this._create_controller(MouseEventsController2);
  }
  get pointer_events_controller() {
    return this._pointer_events_controller = this._pointer_events_controller || this._create_controller(PointerEventsController2);
  }
  get scene_events_controller() {
    return this._scene_events_controller = this._scene_events_controller || this._create_controller(SceneEventsController2);
  }
  _create_controller(event_constructor) {
    const controller = new event_constructor(this);
    if (!this._controllers.includes(controller)) {
      this._controllers.push(controller);
    }
    return controller;
  }
}

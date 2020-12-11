import {CamerasController as CamerasController2} from "./utils/CamerasController";
import {Cooker as Cooker2} from "./utils/Cooker";
import {CookController as CookController2} from "./utils/CookController";
import {CoreGraph as CoreGraph2} from "../../core/graph/CoreGraph";
import {CorePerformance as CorePerformance2} from "../../core/performance/CorePerformance";
import {DispatchController as DispatchController2} from "./utils/DispatchController";
import {ExpressionsController as ExpressionsController2} from "./utils/ExpressionsController";
import {LifeCycleController as LifeCycleController2} from "./utils/LifeCycleController";
import {LoadingController as LoadingController2} from "./utils/LoadingController";
import {MissingReferencesController as MissingReferencesController2} from "./utils/MissingReferencesController";
import {NodesController as NodesController2} from "./utils/NodesController";
import {PolySceneSerializer} from "./utils/Serializer";
import {SceneEventsDispatcher} from "./utils/events/EventsDispatcher";
import {ReferencesController as ReferencesController2} from "./utils/ReferencesController";
import {TimeController as TimeController2} from "./utils/TimeController";
import {UniformsController as UniformsController2} from "./utils/UniformsController";
import {ViewersRegister as ViewersRegister2} from "./utils/ViewersRegister";
import {WebGLController as WebGLController2} from "./utils/WebGLController";
import {Scene as Scene2} from "three/src/scenes/Scene";
import {SceneAssetsController} from "./utils/AssetsController";
import {SceneLibsController} from "./utils/LibsController";
export class PolyScene {
  constructor() {
    this._default_scene = new Scene2();
    this._cameras_controller = new CamerasController2(this);
    this._cooker = new Cooker2(this);
    this.cook_controller = new CookController2();
    this._graph = new CoreGraph2();
    this._missing_expression_references_controller = new MissingReferencesController2(this);
    this._expressions_controller = new ExpressionsController2();
    this._nodes_controller = new NodesController2(this);
    this._references_controller = new ReferencesController2(this);
    this._time_controller = new TimeController2(this);
    this._read_only = false;
    this._default_scene.name = "default_scene";
    this._default_scene.matrixAutoUpdate = false;
    this._graph.set_scene(this);
    this.nodes_controller.init();
  }
  get default_scene() {
    return this._default_scene;
  }
  set_uuid(uuid) {
    return this._uuid = uuid;
  }
  get uuid() {
    return this._uuid;
  }
  set_name(name) {
    return this._name = name;
  }
  get name() {
    return this._name;
  }
  get cameras_controller() {
    return this._cameras_controller;
  }
  get cooker() {
    return this._cooker;
  }
  get assets_controller() {
    return this._assets_controller = this._assets_controller || new SceneAssetsController();
  }
  get libs_controller() {
    return this._libs_controller = this._libs_controller || new SceneLibsController();
  }
  async wait_for_cooks_completed() {
    return this.cook_controller.wait_for_cooks_completed();
  }
  get dispatch_controller() {
    return this._dispatch_controller = this._dispatch_controller || new DispatchController2(this);
  }
  get events_dispatcher() {
    return this._events_dispatcher = this._events_dispatcher || new SceneEventsDispatcher(this);
  }
  get graph() {
    return this._graph;
  }
  get lifecycle_controller() {
    return this._lifecycle_controller = this._lifecycle_controller || new LifeCycleController2(this);
  }
  get loading_controller() {
    return this._loading_controller = this._loading_controller || new LoadingController2(this);
  }
  get missing_expression_references_controller() {
    return this._missing_expression_references_controller;
  }
  get expressions_controller() {
    return this._expressions_controller;
  }
  get nodes_controller() {
    return this._nodes_controller;
  }
  get references_controller() {
    return this._references_controller;
  }
  get performance() {
    return this._performance = this._performance || new CorePerformance2();
  }
  get viewers_register() {
    return this._viewers_register = this._viewers_register || new ViewersRegister2(this);
  }
  get time_controller() {
    return this._time_controller;
  }
  set_frame(frame) {
    this.time_controller.set_frame(frame);
  }
  get frame() {
    return this.time_controller.frame;
  }
  get time() {
    return this.time_controller.time;
  }
  get frame_range() {
    return this.time_controller.frame_range;
  }
  play() {
    this.time_controller.play();
  }
  pause() {
    this.time_controller.pause();
  }
  get serializer() {
    return this._serializer = this._serializer || new PolySceneSerializer(this);
  }
  to_json() {
    return this.serializer.to_json();
  }
  mark_as_read_only(requester) {
    if (this._read_only) {
      return;
    }
    this._read_only_requester = requester;
    this._read_only = true;
  }
  read_only() {
    return this._read_only;
  }
  read_only_requester() {
    return this._read_only_requester;
  }
  get uniforms_controller() {
    return this._uniforms_controller = this._uniforms_controller || new UniformsController2(this);
  }
  get webgl_controller() {
    return this._webgl_controller = this._webgl_controller || new WebGLController2();
  }
  batch_update(callback) {
    this._cooker.block();
    callback();
    this._cooker.unblock();
  }
  node(path) {
    return this.nodes_controller.node(path);
  }
  get root() {
    return this.nodes_controller.root;
  }
}

import {RenderersController as RenderersController2} from "./poly/RenderersController";
import {
  NodesRegister as NodesRegister2,
  OperationsRegister
} from "./poly/registers/nodes/NodesRegister";
import {ExpressionRegister as ExpressionRegister2} from "./poly/registers/expressions/ExpressionRegister";
import {DynamicModulesRegister as DynamicModulesRegister2} from "./poly/registers/modules/DynamicModulesRegister";
import {AssemblersRegister} from "./poly/registers/assemblers/AssemblersRegistry";
export class Poly {
  constructor() {
    this.renderers_controller = new RenderersController2();
    this.nodes_register = new NodesRegister2();
    this.operations_register = new OperationsRegister();
    this.expressions_register = new ExpressionRegister2();
    this.modules_register = new DynamicModulesRegister2();
    this.assemblers_register = new AssemblersRegister();
    this.scenes_by_uuid = {};
    this._version = __POLYGONJS_VERSION__;
    this._player_mode = true;
    this._logger = null;
  }
  static instance() {
    return this._instance = this._instance || new Poly();
  }
  version() {
    return this._version;
  }
  set_player_mode(mode) {
    this._player_mode = mode;
  }
  player_mode() {
    return this._player_mode;
  }
  register_node(node, tab_menu_category, options) {
    this.nodes_register.register_node(node, tab_menu_category, options);
  }
  register_operation(operation) {
    this.operations_register.register_operation(operation);
  }
  registered_nodes(parent_context, type) {
    return this.nodes_register.registered_nodes(parent_context, type);
  }
  registered_operation(parent_context, operation_type) {
    return this.operations_register.registered_operation(parent_context, operation_type);
  }
  in_worker_thread() {
    return false;
  }
  desktop_controller() {
  }
  set_env(env) {
    this._env = env;
  }
  get env() {
    return this._env;
  }
  set_logger(logger) {
    this._logger = logger;
  }
  get logger() {
    return this._logger;
  }
  log_engine_version() {
    this._logger?.log(`POLYGONJS: '${this._version}'`);
  }
  static log(message, ...optionalParams) {
    this.instance().logger?.log(...[message, ...optionalParams]);
  }
  static warn(message, ...optionalParams) {
    this.instance().logger?.warn(...[message, ...optionalParams]);
  }
  static error(message, ...optionalParams) {
    this.instance().logger?.error(...[message, ...optionalParams]);
  }
}

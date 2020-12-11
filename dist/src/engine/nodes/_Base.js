import {CoreGraphNode as CoreGraphNode2} from "../../core/graph/CoreGraphNode";
import {UIData as UIData2} from "./utils/UIData";
import {FlagsControllerD} from "./utils/FlagsController";
import {StatesController as StatesController2} from "./utils/StatesController";
import {HierarchyParentController} from "./utils/hierarchy/ParentController";
import {HierarchyChildrenController} from "./utils/hierarchy/ChildrenController";
import {LifeCycleController as LifeCycleController2} from "./utils/LifeCycleController";
import {TypedContainerController} from "./utils/ContainerController";
import {NodeCookController} from "./utils/CookController";
import {NameController as NameController2} from "./utils/NameController";
import {NodeSerializer} from "./utils/Serializer";
import {ParamsController as ParamsController2} from "./utils/params/ParamsController";
import {ParamsValueAccessor as ParamsValueAccessor2} from "./utils/params/ParamsValueAccessor";
import {IOController as IOController2} from "./utils/io/IOController";
import {ParamsAccessor as ParamsAccessor2} from "./utils/params/ParamsAccessor";
export class TypedNode extends CoreGraphNode2 {
  constructor(scene, name = "BaseNode", params_init_value_overrides) {
    super(scene, name);
    this.params_init_value_overrides = params_init_value_overrides;
    this.container_controller = new TypedContainerController(this);
    this.pv = new ParamsValueAccessor2();
    this.p = new ParamsAccessor2();
    this._initialized = false;
  }
  copy_param_values(node) {
    const non_spare = this.params.non_spare;
    for (let param of non_spare) {
      const other_param = node.params.get(param.name);
      if (other_param) {
        param.copy_value(other_param);
      }
    }
  }
  get parent_controller() {
    return this._parent_controller = this._parent_controller || new HierarchyParentController(this);
  }
  static displayed_input_names() {
    return [];
  }
  get children_controller_context() {
    return this._children_controller_context;
  }
  _create_children_controller() {
    if (this._children_controller_context) {
      return new HierarchyChildrenController(this, this._children_controller_context);
    }
  }
  get children_controller() {
    return this._children_controller = this._children_controller || this._create_children_controller();
  }
  children_allowed() {
    return this._children_controller_context != null;
  }
  get ui_data() {
    return this._ui_data = this._ui_data || new UIData2(this);
  }
  get states() {
    return this._states = this._states || new StatesController2(this);
  }
  get lifecycle() {
    return this._lifecycle = this._lifecycle || new LifeCycleController2(this);
  }
  get serializer() {
    return this._serializer = this._serializer || new NodeSerializer(this);
  }
  get cook_controller() {
    return this._cook_controller = this._cook_controller || new NodeCookController(this);
  }
  get io() {
    return this._io = this._io || new IOController2(this);
  }
  get name_controller() {
    return this._name_controller = this._name_controller || new NameController2(this);
  }
  set_name(name) {
    this.name_controller.set_name(name);
  }
  _set_core_name(name) {
    this._name = name;
  }
  get params() {
    return this._params_controller = this._params_controller || new ParamsController2(this);
  }
  initialize_base_and_node() {
    if (!this._initialized) {
      this._initialized = true;
      this.display_node_controller?.initialize_node();
      this.initialize_base_node();
      this.initialize_node();
      if (this.poly_node_controller) {
        this.poly_node_controller.initialize_node();
      }
    } else {
      console.warn("node already initialized");
    }
  }
  initialize_base_node() {
  }
  initialize_node() {
  }
  static type() {
    throw "type to be overriden";
  }
  get type() {
    const c = this.constructor;
    return c.type();
  }
  static node_context() {
    console.error("node has no node_context", this);
    throw "node_context requires override";
  }
  node_context() {
    const c = this.constructor;
    return c.node_context();
  }
  static require_webgl2() {
    return false;
  }
  require_webgl2() {
    const c = this.constructor;
    return c.require_webgl2();
  }
  set_parent(parent) {
    this.parent_controller.set_parent(parent);
  }
  get parent() {
    return this.parent_controller.parent;
  }
  get root() {
    return this._scene.root;
  }
  full_path(relative_to_parent) {
    return this.parent_controller.full_path(relative_to_parent);
  }
  create_params() {
  }
  add_param(type, name, default_value, options) {
    return this._params_controller?.add_param(type, name, default_value, options);
  }
  param_default_value(name) {
    return null;
  }
  cook(input_contents) {
    return null;
  }
  async request_container() {
    if (!this.is_dirty) {
      return this.container_controller.container;
    } else {
      return await this.container_controller.request_container();
    }
  }
  set_container(content, message = null) {
    this.container_controller.container.set_content(content);
    if (content != null) {
      if (!content.name) {
        content.name = this.full_path();
      }
      if (!content.node) {
        content.node = this;
      }
    }
    this.cook_controller.end_cook(message);
  }
  create_node(type, params_init_value_overrides) {
    return this.children_controller?.create_node(type, params_init_value_overrides);
  }
  createNode(node_class, params_init_value_overrides) {
    return this.children_controller?.createNode(node_class, params_init_value_overrides);
  }
  create_operation_container(type, operation_container_name, params_init_value_overrides) {
    return this.children_controller?.create_operation_container(type, operation_container_name, params_init_value_overrides);
  }
  remove_node(node) {
    this.children_controller?.remove_node(node);
  }
  children() {
    return this.children_controller?.children() || [];
  }
  node(path) {
    return this.parent_controller?.find_node(path) || null;
  }
  node_sibbling(name) {
    if (this.parent) {
      const node = this.parent.children_controller?.child_by_name(name);
      if (node) {
        return node;
      }
    }
    return null;
  }
  nodes_by_type(type) {
    return this.children_controller?.nodes_by_type(type) || [];
  }
  set_input(input_index_or_name, node, output_index_or_name = 0) {
    this.io.inputs.set_input(input_index_or_name, node, output_index_or_name);
  }
  emit(event_name, data = null) {
    this.scene.dispatch_controller.dispatch(this, event_name, data);
  }
  to_json(include_param_components = false) {
    return this.serializer.to_json(include_param_components);
  }
  async required_modules() {
  }
  used_assembler() {
  }
  integration_data() {
  }
}
export class BaseNodeClass extends TypedNode {
}
export class BaseNodeClassWithDisplayFlag extends TypedNode {
  constructor() {
    super(...arguments);
    this.flags = new FlagsControllerD(this);
  }
}

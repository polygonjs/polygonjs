import {TypedObjNode} from "./_Base";
import {Group as Group2} from "three/src/objects/Group";
import {DisplayNodeController as DisplayNodeController2} from "../utils/DisplayNodeController";
import {NodeContext as NodeContext2} from "../../poly/NodeContext";
import {TransformedParamConfig, TransformController as TransformController2} from "./utils/TransformController";
import {FlagsControllerD} from "../utils/FlagsController";
import {HierarchyController as HierarchyController2} from "./utils/HierarchyController";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {ChildrenDisplayController as ChildrenDisplayController2} from "./utils/ChildrenDisplayController";
class GeoObjParamConfig extends TransformedParamConfig(NodeParamsConfig) {
  constructor() {
    super(...arguments);
    this.display = ParamConfig.BOOLEAN(1);
    this.render_order = ParamConfig.INTEGER(0, {
      range: [0, 10],
      range_locked: [true, false]
    });
  }
}
const ParamsConfig2 = new GeoObjParamConfig();
export class GeoObjNode extends TypedObjNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this.hierarchy_controller = new HierarchyController2(this);
    this.transform_controller = new TransformController2(this);
    this.flags = new FlagsControllerD(this);
    this.children_display_controller = new ChildrenDisplayController2(this);
    this.display_node_controller = new DisplayNodeController2(this, this.children_display_controller.display_node_controller_callbacks());
    this._children_controller_context = NodeContext2.SOP;
    this._on_create_bound = this._on_create.bind(this);
    this._on_child_add_bound = this._on_child_add.bind(this);
  }
  static type() {
    return "geo";
  }
  create_object() {
    const group = new Group2();
    group.matrixAutoUpdate = false;
    return group;
  }
  initialize_node() {
    this.lifecycle.add_on_create_hook(this._on_create_bound);
    this.lifecycle.add_on_child_add_hook(this._on_child_add_bound);
    this.hierarchy_controller.initialize_node();
    this.transform_controller.initialize_node();
    this.children_display_controller.initialize_node();
  }
  is_display_node_cooking() {
    if (this.flags.display.active) {
      const display_node = this.display_node_controller.display_node;
      return display_node ? display_node.is_dirty : false;
    } else {
      return false;
    }
  }
  create_node(type, params_init_value_overrides) {
    return super.create_node(type, params_init_value_overrides);
  }
  createNode(node_class, params_init_value_overrides) {
    return super.createNode(node_class, params_init_value_overrides);
  }
  children() {
    return super.children();
  }
  nodes_by_type(type) {
    return super.nodes_by_type(type);
  }
  _on_create() {
    this.create_node("box");
  }
  _on_child_add(node) {
    if (this.scene.loading_controller.loaded) {
      if (this.children().length == 1) {
        node.flags?.display?.set(true);
      }
    }
  }
  cook() {
    this.transform_controller.update();
    this.object.visible = this.pv.display;
    this.object.renderOrder = this.pv.render_order;
    this.cook_controller.end_cook();
  }
}

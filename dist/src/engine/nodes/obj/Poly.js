import {TypedObjNode} from "./_Base";
import {Group as Group2} from "three/src/objects/Group";
import {DisplayNodeController as DisplayNodeController2} from "../utils/DisplayNodeController";
import {NodeContext as NodeContext2} from "../../poly/NodeContext";
import {FlagsControllerD} from "../utils/FlagsController";
import {HierarchyController as HierarchyController2} from "./utils/HierarchyController";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {ChildrenDisplayController as ChildrenDisplayController2} from "./utils/ChildrenDisplayController";
import {PolyNodeController as PolyNodeController2} from "../utils/poly/PolyNodeController";
export function create_poly_obj_node(node_type, definition) {
  class PolyObjParamConfig extends NodeParamsConfig {
    constructor() {
      super(...arguments);
      this.display = ParamConfig.BOOLEAN(1);
      this.template = ParamConfig.OPERATOR_PATH("../template");
      this.debug = ParamConfig.BUTTON(null, {
        callback: (node) => {
          BasePolyObjNode2.PARAM_CALLBACK_debug(node);
        }
      });
    }
  }
  const ParamsConfig2 = new PolyObjParamConfig();
  class BasePolyObjNode2 extends TypedObjNode {
    constructor() {
      super(...arguments);
      this.params_config = ParamsConfig2;
      this.hierarchy_controller = new HierarchyController2(this);
      this.flags = new FlagsControllerD(this);
      this.children_display_controller = new ChildrenDisplayController2(this);
      this.display_node_controller = new DisplayNodeController2(this, this.children_display_controller.display_node_controller_callbacks());
      this._children_controller_context = NodeContext2.SOP;
      this.poly_node_controller = new PolyNodeController2(this, definition);
    }
    static type() {
      return node_type;
    }
    create_object() {
      const group = new Group2();
      group.matrixAutoUpdate = false;
      return group;
    }
    initialize_node() {
      this.hierarchy_controller.initialize_node();
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
    cook() {
      this.object.visible = this.pv.display;
      this.cook_controller.end_cook();
    }
    static PARAM_CALLBACK_debug(node) {
      node._debug();
    }
    _debug() {
      this.poly_node_controller.debug(this.p.template);
    }
  }
  return BasePolyObjNode2;
}
const BasePolyObjNode = create_poly_obj_node("poly", {node_context: NodeContext2.OBJ});
export class PolyObjNode extends BasePolyObjNode {
}

import {ParamLessBaseManagerObjNode} from "./_BaseManager";
import {NodeContext as NodeContext2, NetworkNodeType} from "../../poly/NodeContext";
export class CopObjNode extends ParamLessBaseManagerObjNode {
  constructor() {
    super(...arguments);
    this._children_controller_context = NodeContext2.COP;
  }
  static type() {
    return NetworkNodeType.COP;
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
}

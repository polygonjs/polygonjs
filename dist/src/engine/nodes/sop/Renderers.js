import {ParamLessBaseNetworkSopNode} from "./_Base";
import {NodeContext as NodeContext2, NetworkNodeType} from "../../poly/NodeContext";
export class RenderersSopNode extends ParamLessBaseNetworkSopNode {
  constructor() {
    super(...arguments);
    this._children_controller_context = NodeContext2.ROP;
  }
  static type() {
    return NetworkNodeType.ROP;
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
}

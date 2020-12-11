import {CoreGraphNode as CoreGraphNode2} from "../../core/graph/CoreGraphNode";
export class NamesListener extends CoreGraphNode2 {
  constructor(param, node_simple, jsep_node) {
    super(param.scene, "NamesListener");
    this.param = param;
    this.node_simple = node_simple;
    this.jsep_node = jsep_node;
    this.connect_to_nodes_in_path();
  }
  reset() {
  }
  connect_to_nodes_in_path() {
    this.find_nodes_in_path();
  }
  find_nodes_in_path() {
    console.log("find nodes in path");
  }
}

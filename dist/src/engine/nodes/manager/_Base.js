import {TypedNode} from "../_Base";
import {NodeContext as NodeContext2} from "../../poly/NodeContext";
export class TypedBaseManagerNode extends TypedNode {
  static node_context() {
    return NodeContext2.MANAGER;
  }
}
export class BaseManagerNodeClass extends TypedBaseManagerNode {
}

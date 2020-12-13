import {BaseOperation} from "../_Base";
import {NodeContext as NodeContext2} from "../../../engine/poly/NodeContext";
export class BaseCopOperation extends BaseOperation {
  static context() {
    return NodeContext2.COP;
  }
  cook(input_contents, params) {
  }
}

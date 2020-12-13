import {TypedNode} from "../_Base";
import {NodeContext as NodeContext2} from "../../poly/NodeContext";
import {FlagsController as FlagsController2} from "../utils/FlagsController";
export class TypedRopNode extends TypedNode {
  constructor() {
    super(...arguments);
    this.flags = new FlagsController2(this);
  }
  static node_context() {
    return NodeContext2.ROP;
  }
  initialize_base_node() {
    this.dirty_controller.add_post_dirty_hook("cook_immediately", () => {
      this.cook_controller.cook_main_without_inputs();
    });
  }
  cook() {
    this.cook_controller.end_cook();
  }
}
export class BaseRopNodeClass extends TypedRopNode {
}

import {TypedNode} from "../_Base";
import {NodeContext as NodeContext2} from "../../poly/NodeContext";
import {FlagsControllerB} from "../utils/FlagsController";
const INPUT_GEOMETRY_NAME = "input animation clip";
const DEFAULT_INPUT_NAMES = [INPUT_GEOMETRY_NAME, INPUT_GEOMETRY_NAME, INPUT_GEOMETRY_NAME, INPUT_GEOMETRY_NAME];
export class TypedAnimNode extends TypedNode {
  constructor() {
    super(...arguments);
    this.flags = new FlagsControllerB(this);
  }
  static node_context() {
    return NodeContext2.ANIM;
  }
  static displayed_input_names() {
    return DEFAULT_INPUT_NAMES;
  }
  initialize_base_node() {
    this.io.outputs.set_has_one_output();
  }
  set_timeline_builder(timeline_builder) {
    this.set_container(timeline_builder);
  }
}
export class BaseAnimNodeClass extends TypedAnimNode {
}

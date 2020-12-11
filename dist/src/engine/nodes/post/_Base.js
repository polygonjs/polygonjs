import {TypedNode} from "../_Base";
import {NodeContext as NodeContext2} from "../../poly/NodeContext";
import {FlagsControllerDB} from "../utils/FlagsController";
const INPUT_PASS_NAME = "input pass";
const DEFAULT_INPUT_NAMES = [INPUT_PASS_NAME];
function PostParamCallback(node, param) {
  TypedPostProcessNode.PARAM_CALLBACK_update_passes(node);
}
export const PostParamOptions = {
  cook: false,
  callback: PostParamCallback,
  compute_on_dirty: true
};
export class TypedPostProcessNode extends TypedNode {
  constructor() {
    super(...arguments);
    this.flags = new FlagsControllerDB(this);
    this._passes_by_requester_id = new Map();
    this._update_pass_bound = this.update_pass.bind(this);
  }
  static node_context() {
    return NodeContext2.POST;
  }
  static displayed_input_names() {
    return DEFAULT_INPUT_NAMES;
  }
  initialize_node() {
    this.flags.display.set(false);
    this.flags.display.add_hook(() => {
      if (this.flags.display.active) {
        const parent = this.parent;
        if (parent && parent.display_node_controller) {
          parent.display_node_controller.set_display_node(this);
        }
      }
    });
    this.io.inputs.set_count(0, 1);
    this.io.outputs.set_has_one_output();
  }
  set_render_pass(render_pass) {
    this.set_container(render_pass);
  }
  cook() {
    this.cook_controller.end_cook();
  }
  setup_composer(context) {
    this._add_pass_from_input(0, context);
    if (!this.flags.bypass.active) {
      let pass = this._passes_by_requester_id.get(context.requester.graph_node_id);
      if (!pass) {
        pass = this._create_pass(context);
        if (pass) {
          this._passes_by_requester_id.set(context.requester.graph_node_id, pass);
        }
      }
      if (pass) {
        context.composer.addPass(pass);
      }
    }
  }
  _add_pass_from_input(index, context) {
    const input = this.io.inputs.input(index);
    if (input) {
      input.setup_composer(context);
    }
  }
  _create_pass(context) {
    return void 0;
  }
  static PARAM_CALLBACK_update_passes(node) {
    node.update_passes();
  }
  update_passes() {
    this._passes_by_requester_id.forEach(this._update_pass_bound);
  }
  update_pass(pass) {
  }
}
export class BasePostProcessNodeClass extends TypedPostProcessNode {
}

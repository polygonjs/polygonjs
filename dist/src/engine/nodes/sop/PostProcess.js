import {BaseNetworkSopNode} from "./_Base";
import {NodeContext as NodeContext2} from "../../poly/NodeContext";
import {DisplayNodeController as DisplayNodeController2} from "../utils/DisplayNodeController";
import {EffectsComposerController as EffectsComposerController2, PostProcessNetworkParamsConfig} from "../post/utils/EffectsComposerController";
export class PostProcessSopNode extends BaseNetworkSopNode {
  constructor() {
    super(...arguments);
    this.params_config = new PostProcessNetworkParamsConfig();
    this.effects_composer_controller = new EffectsComposerController2(this);
    this.display_node_controller = new DisplayNodeController2(this, this.effects_composer_controller.display_node_controller_callbacks());
    this._children_controller_context = NodeContext2.POST;
  }
  static type() {
    return "post_process";
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

import {DisplayNodeController as DisplayNodeController2} from "../../../utils/DisplayNodeController";
import {SubnetOutputSopNode} from "../../SubnetOutput";
import {CoreGraphNode as CoreGraphNode2} from "../../../../../core/graph/CoreGraphNode";
import {TypedSopNode} from "../../_Base";
import {NodeContext as NodeContext2} from "../../../../poly/NodeContext";
export class SubnetSopNodeLike extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.children_display_controller = new SopSubnetChildrenDisplayController(this);
    this.display_node_controller = new DisplayNodeController2(this, this.children_display_controller.display_node_controller_callbacks());
    this._children_controller_context = NodeContext2.SOP;
  }
  initialize_base_node() {
    super.initialize_base_node();
    this.children_display_controller.initialize_node();
    this.cook_controller.disallow_inputs_evaluation();
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
  async cook(input_contents) {
    const child_output_node = this.children_display_controller.output_node();
    if (child_output_node) {
      const container = await child_output_node.request_container();
      const core_content = container.core_content();
      if (core_content) {
        this.set_core_group(core_content);
      } else {
        if (child_output_node.states.error.active) {
          this.states.error.set(child_output_node.states.error.message);
        } else {
          this.set_objects([]);
        }
      }
    } else {
      this.states.error.set("no output node found inside subnet");
    }
  }
}
export class SopSubnetChildrenDisplayController {
  constructor(node) {
    this.node = node;
    this._output_node_needs_update = true;
  }
  display_node_controller_callbacks() {
    return {
      on_display_node_remove: () => {
        this.node.set_dirty();
      },
      on_display_node_set: () => {
        this.node.set_dirty();
      },
      on_display_node_update: () => {
        this.node.set_dirty();
      }
    };
  }
  output_node() {
    if (this._output_node_needs_update) {
      this._update_output_node();
    }
    return this._output_node;
  }
  initialize_node() {
    const display_flag = this.node.flags?.display;
    if (display_flag) {
      display_flag.add_hook(() => {
        if (display_flag.active) {
          this.node.set_dirty();
        }
      });
    }
    this.node.lifecycle.add_on_child_add_hook(() => {
      this._output_node_needs_update = true;
      this.node.set_dirty();
    });
    this.node.lifecycle.add_on_child_remove_hook(() => {
      this._output_node_needs_update = true;
      this.node.set_dirty();
    });
  }
  _update_output_node() {
    const found_node = this.node.nodes_by_type(SubnetOutputSopNode.type())[0];
    if (this._output_node == null || found_node == null || this._output_node.graph_node_id != found_node.graph_node_id) {
      if (this._graph_node && this._output_node) {
        this._graph_node.remove_graph_input(this._output_node);
      }
      this._output_node = found_node;
      if (this._output_node) {
        this._graph_node = this._graph_node || this._create_graph_node();
        this._graph_node.add_graph_input(this._output_node);
      }
    }
  }
  _create_graph_node() {
    const graph_node = new CoreGraphNode2(this.node.scene, "subnet_children_display_controller");
    graph_node.add_post_dirty_hook("subnet_children_display_controller", () => {
      this.node.set_dirty();
    });
    return graph_node;
  }
}

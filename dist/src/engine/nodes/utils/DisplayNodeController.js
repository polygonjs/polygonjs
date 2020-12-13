import {CoreGraphNode as CoreGraphNode2} from "../../../core/graph/CoreGraphNode";
export class DisplayNodeController {
  constructor(node, callbacks) {
    this.node = node;
    this._initialized = false;
    this._display_node = void 0;
    this._graph_node = new CoreGraphNode2(node.scene, "DisplayNodeController");
    this._graph_node.node = node;
    this._on_display_node_remove_callback = callbacks.on_display_node_remove;
    this._on_display_node_set_callback = callbacks.on_display_node_set;
    this._on_display_node_update_callback = callbacks.on_display_node_update;
  }
  get display_node() {
    return this._display_node;
  }
  initialize_node() {
    if (this._initialized) {
      console.error("display node controller already initialed", this.node);
      return;
    }
    this._initialized = true;
    this.node.lifecycle.add_on_child_add_hook((child_node) => {
      if (!this._display_node) {
        child_node.flags?.display?.set(true);
      }
    });
    this.node.lifecycle.add_on_child_remove_hook((child_node) => {
      if (child_node.graph_node_id == this._display_node?.graph_node_id) {
        const children = this.node.children();
        const last_child = children[children.length - 1];
        if (last_child) {
          last_child.flags?.display?.set(true);
        } else {
          this.set_display_node(void 0);
        }
      }
    });
    this._graph_node.dirty_controller.add_post_dirty_hook("_request_display_node_container", () => {
      this._on_display_node_update_callback();
    });
  }
  async set_display_node(new_display_node) {
    if (!this._initialized) {
      console.error("display node controller not initialized", this.node);
    }
    if (this._display_node != new_display_node) {
      const old_display_node = this._display_node;
      if (old_display_node) {
        old_display_node.flags.display.set(false);
        this._graph_node.remove_graph_input(old_display_node);
        this._on_display_node_remove_callback();
      }
      this._display_node = new_display_node;
      if (this._display_node) {
        this._graph_node.add_graph_input(this._display_node);
        this._on_display_node_set_callback();
      }
    }
  }
}

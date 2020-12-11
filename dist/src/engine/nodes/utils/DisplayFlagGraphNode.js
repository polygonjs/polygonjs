import {CoreGraphNode as CoreGraphNode2} from "../../../core/graph/CoreGraphNode";
export class DisplayFlagGraphNode extends CoreGraphNode2 {
  constructor(_owner) {
    super(_owner.scene, "DisplayFlagGraphNode");
    this._owner = _owner;
    this._owner_post_display_flag_node_set_dirty_bound = this._owner_post_display_flag_node_set_dirty.bind(this);
    this._owner = _owner;
    this.add_post_dirty_hook("_owner_post_display_flag_node_set_dirty", this._owner_post_display_flag_node_set_dirty_bound);
  }
  _owner_post_display_flag_node_set_dirty() {
  }
}

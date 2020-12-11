import {CoreGraphNode as CoreGraphNode2} from "../../../core/graph/CoreGraphNode";
export class UIData extends CoreGraphNode2 {
  constructor(scene, param) {
    super(scene, "param ui data");
    this.param = param;
    this._update_visibility_and_remove_dirty_bound = this.update_visibility_and_remove_dirty.bind(this);
    this.add_post_dirty_hook("_update_visibility_and_remove_dirty", this._update_visibility_and_remove_dirty_bound);
  }
  update_visibility_and_remove_dirty() {
    this.update_visibility();
    this.remove_dirty_state();
  }
  update_visibility() {
    this.param.options.update_visibility();
  }
}

import {CoreGraphNode as CoreGraphNode2} from "../../../core/graph/CoreGraphNode";
export class BaseCopyStamp extends CoreGraphNode2 {
  constructor(scene) {
    super(scene, "CopyStamp");
    this._global_index = 0;
  }
  set_global_index(index) {
    this._global_index = index;
    this.set_dirty();
    this.remove_dirty_state();
  }
  value(attrib_name) {
    return this._global_index;
  }
}

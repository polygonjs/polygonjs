import {BaseCopyStamp} from "../../utils/CopyStamp";
export class CopyStamp extends BaseCopyStamp {
  set_point(point) {
    this._point = point;
    this.set_dirty();
    this.remove_dirty_state();
  }
  value(attrib_name) {
    if (this._point) {
      if (attrib_name) {
        return this._point.attrib_value(attrib_name);
      } else {
        return this._point.index;
      }
    } else {
      return this._global_index;
    }
  }
}

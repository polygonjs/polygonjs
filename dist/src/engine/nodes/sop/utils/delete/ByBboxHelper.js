import {Box3 as Box32} from "three/src/math/Box3";
import {Vector3 as Vector32} from "three/src/math/Vector3";
export class ByBboxHelper {
  constructor(node) {
    this.node = node;
    this._point_position = new Vector32();
  }
  eval_for_points(points) {
    for (let point of points) {
      const in_bbox = this._bbox.containsPoint(point.position(this._point_position));
      if (in_bbox) {
        this.node.entity_selection_helper.select(point);
      }
    }
  }
  get _bbox() {
    return this._bbox_cache != null ? this._bbox_cache : this._bbox_cache = new Box32(this.node.pv.bbox_center.clone().sub(this.node.pv.bbox_size.clone().multiplyScalar(0.5)), this.node.pv.bbox_center.clone().add(this.node.pv.bbox_size.clone().multiplyScalar(0.5)));
  }
}

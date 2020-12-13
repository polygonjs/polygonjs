import {Sphere as Sphere2} from "three/src/math/Sphere";
import lodash_sortBy from "lodash/sortBy";
import {OctreeNode} from "./Node";
export class CoreOctree {
  constructor(bbox) {
    this._root = new OctreeNode(bbox);
  }
  set_points(points) {
    this._root.set_points(points);
  }
  traverse(callback) {
    this._root.traverse(callback);
  }
  find_points(position, distance, max_points_count) {
    const sphere = new Sphere2(position, distance);
    let found_points = [];
    if (this._root.intersects_sphere(sphere)) {
      this._root.points_in_sphere(sphere, found_points);
    }
    if (max_points_count == null) {
      return found_points;
    } else {
      if (found_points.length > max_points_count) {
        found_points = lodash_sortBy(found_points, (point) => {
          return point.position().distanceTo(position);
        });
        found_points = found_points.slice(0, max_points_count);
      }
      return found_points;
    }
  }
}

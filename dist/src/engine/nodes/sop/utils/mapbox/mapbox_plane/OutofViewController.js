import {Vector3 as Vector32} from "three/src/math/Vector3";
import {CoreGeometry} from "../../../../../../core/geometry/Geometry";
import {CoreMath} from "../../../../../../core/math/_Module";
import {Triangle as Triangle2} from "three/src/math/Triangle";
import {ObjectType} from "../../../../../../core/geometry/Constant";
export class MapboxPlaneFrustumController {
  constructor(node) {
    this.node = node;
    this._triangle_a = new Triangle2();
    this._triangle_b = new Triangle2();
    this._point_pos = new Vector32();
  }
  delete_out_of_view(geometry, core_geo, camera_node, transformer, plane_dimensions, segments_counts) {
    const near_lng_lat_pts = camera_node.vertical_near_lng_lat_points();
    const far_lng_lat_pts = camera_node.vertical_far_lng_lat_points();
    if (!near_lng_lat_pts || !far_lng_lat_pts) {
      return;
    }
    let delete_out_of_view_bound_pts = near_lng_lat_pts.concat(far_lng_lat_pts);
    const delete_out_of_view_margin = Math.max(plane_dimensions.x / segments_counts.x, plane_dimensions.y / segments_counts.y);
    console.log("delete_out_of_view_margin", delete_out_of_view_margin);
    return this._delete_out_of_view(core_geo, delete_out_of_view_bound_pts, delete_out_of_view_margin * 2);
  }
  _delete_out_of_view(core_geo, bound_pts, margin) {
    const points = core_geo.points();
    const positions = bound_pts.map((bound_pt) => new Vector32(bound_pt.lng, 0, bound_pt.lat));
    this._triangle_a.a.copy(positions[0]);
    this._triangle_a.b.copy(positions[1]);
    this._triangle_a.c.copy(positions[2]);
    this._triangle_b.a.copy(positions[2]);
    this._triangle_b.b.copy(positions[3]);
    this._triangle_b.c.copy(positions[1]);
    CoreMath.expand_triangle(this._triangle_a, margin);
    CoreMath.expand_triangle(this._triangle_b, margin);
    const kept_points = [];
    for (let point of points) {
      point.position(this._point_pos);
      if (this._triangle_b.containsPoint(this._point_pos)) {
        kept_points.push(point);
      }
    }
    return CoreGeometry.geometry_from_points(kept_points, ObjectType.MESH);
  }
}

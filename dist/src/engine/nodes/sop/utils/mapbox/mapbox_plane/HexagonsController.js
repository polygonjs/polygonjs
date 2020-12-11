import {Vector3 as Vector32} from "three/src/math/Vector3";
import {CoreGeometryOperationHexagon} from "../../../../../../core/geometry/operation/Hexagon";
import {CoreTransform} from "../../../../../../core/Transform";
export class MapboxPlaneHexagonsController {
  constructor(node) {
    this.node = node;
    this._core_transform = new CoreTransform();
  }
  geometry(plane_dimensions, segments_counts) {
    const hexagons_radius = Math.max(plane_dimensions.x / segments_counts.x, plane_dimensions.y / segments_counts.y);
    let hexagons_scale_compensate;
    if (!this.node.pv.mapbox_transform) {
      const new_plane_dimensions = {
        x: segments_counts.x * hexagons_radius,
        y: segments_counts.y * hexagons_radius
      };
      hexagons_scale_compensate = new Vector32(1, plane_dimensions.y / new_plane_dimensions.y, 1);
      plane_dimensions.x = new_plane_dimensions.x;
      plane_dimensions.y = new_plane_dimensions.y;
    }
    const operation = new CoreGeometryOperationHexagon(plane_dimensions, hexagons_radius, true);
    const geometry = operation.process();
    this._core_transform.rotate_geometry(geometry, new Vector32(0, 1, 0), new Vector32(0, 0, 1));
    if (!this.node.pv.mapbox_transform && hexagons_scale_compensate) {
      geometry.scale(hexagons_scale_compensate.x, hexagons_scale_compensate.y, hexagons_scale_compensate.z);
    }
    return geometry;
  }
}

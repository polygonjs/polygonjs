import {MapboxPlaneSopNode} from '../../../MapboxPlane';
import {Vector2} from 'three/src/math/Vector2';
import {Vector3} from 'three/src/math/Vector3';
import {CoreGeometryOperationHexagon} from '../../../../../../core/geometry/operation/Hexagon';
import {CoreTransform} from '../../../../../../core/Transform';

export class MapboxPlaneHexagonsController {
	private _core_transform = new CoreTransform();
	constructor(private node: MapboxPlaneSopNode) {}

	geometry(plane_dimensions: Vector2, segments_counts: Vector2Like) {
		// for the hexagons, we have a constraint which is that
		// we cannot have different segment_counts for x and y,
		// we can only give a hexagon radius
		// therefore we need to compensate the scale.
		// not doing so, in the case of creating the plane in world pos
		// and after pluging it in a mapbox_transform
		// would result in uneven hexagons.
		const hexagons_radius = Math.max(
			plane_dimensions.x / segments_counts.x,
			plane_dimensions.y / segments_counts.y
		);
		let hexagons_scale_compensate: Vector3 | undefined;
		if (!this.node.pv.mapbox_transform) {
			const new_plane_dimensions = {
				x: segments_counts.x * hexagons_radius,
				y: segments_counts.y * hexagons_radius,
			};
			hexagons_scale_compensate = new Vector3(1, plane_dimensions.y / new_plane_dimensions.y, 1);
			plane_dimensions.x = new_plane_dimensions.x;
			plane_dimensions.y = new_plane_dimensions.y;
		}
		const operation = new CoreGeometryOperationHexagon(
			plane_dimensions,
			hexagons_radius,
			true // always as points in the case of hexagons. too complicated otherwise
		);
		const geometry = operation.process();
		this._core_transform.rotate_geometry(geometry, new Vector3(0, 1, 0), new Vector3(0, 0, 1));
		if (!this.node.pv.mapbox_transform && hexagons_scale_compensate) {
			geometry.scale(hexagons_scale_compensate.x, hexagons_scale_compensate.y, hexagons_scale_compensate.z);
		}
		return geometry;
	}
}

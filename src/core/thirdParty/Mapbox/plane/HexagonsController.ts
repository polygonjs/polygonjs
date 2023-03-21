import {Vector2} from 'three';
import {Vector3} from 'three';
import {BufferGeometry} from 'three';
import {CoreGeometryOperationHexagon} from '../../../geometry/operation/Hexagon';
import {CoreTransform} from '../../../Transform';
import {Vector2Like} from '../../../../types/GlobalTypes';

const DIR_ORIGIN = new Vector3(0, 1, 0);
const DIR_DEST = new Vector3(0, 0, 1);
export class MapboxPlaneHexagonsController {
	constructor() {}

	geometry(plane_dimensions: Vector2, segments_counts: Vector2Like, mapboxTransform: boolean): BufferGeometry {
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
		if (!mapboxTransform) {
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
		CoreTransform.rotateGeometry(geometry, DIR_ORIGIN, DIR_DEST);
		if (!mapboxTransform && hexagons_scale_compensate) {
			geometry.scale(hexagons_scale_compensate.x, hexagons_scale_compensate.y, hexagons_scale_compensate.z);
		}
		return geometry;
	}
}

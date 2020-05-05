import {MapboxPlaneSopNode} from '../../../MapboxPlane';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {Vector2} from 'three/src/math/Vector2';
import {Vector3} from 'three/src/math/Vector3';
import {MapboxCameraObjNode} from '../../../../obj/MapboxCamera';
import {CoreMapboxTransform} from '../../../../../../core/mapbox/Transform';
import mapboxgl from 'mapbox-gl';
import {CoreGeometry} from '../../../../../../core/geometry/Geometry';
import {CoreMath} from '../../../../../../core/math/_Module';
import {Triangle} from 'three/src/math/Triangle';
import {ObjectType} from '../../../../../../core/geometry/Constant';
import {CorePoint} from '../../../../../../core/geometry/Point';

export class MapboxPlaneFrustumController {
	// private _core_transform = new CoreTransform();
	constructor(protected node: MapboxPlaneSopNode) {}

	delete_out_of_view(
		geometry: BufferGeometry,
		core_geo: CoreGeometry,
		camera_node: MapboxCameraObjNode,
		transformer: CoreMapboxTransform,
		plane_dimensions: Vector2,
		segments_counts: Vector2Like
	) {
		const near_lng_lat_pts = camera_node.vertical_near_lng_lat_points();
		const far_lng_lat_pts = camera_node.vertical_far_lng_lat_points();
		if (!near_lng_lat_pts || !far_lng_lat_pts) {
			return;
		}
		let delete_out_of_view_bound_pts = near_lng_lat_pts.concat(far_lng_lat_pts);
		// if (this.node.pv.mapbox_transform) {
		// 	const mapbox_delete_out_of_view_bound_pts: mapboxgl.LngLat[] = [];
		// 	for (let p of delete_out_of_view_bound_pts) {
		// 		const pt3d = new Vector3(p.lng, 0, p.lat);
		// 		console.log(pt3d);
		// 		transformer.transform_position_FINAL(pt3d);
		// 		console.log(pt3d.x, pt3d.z);
		// 		const lng_lat = new mapboxgl.LngLat(pt3d.x, pt3d.z);
		// 		mapbox_delete_out_of_view_bound_pts.push(lng_lat);
		// 	}
		// 	delete_out_of_view_bound_pts = mapbox_delete_out_of_view_bound_pts;
		// }
		const delete_out_of_view_margin = Math.max(
			plane_dimensions.x / segments_counts.x,
			plane_dimensions.y / segments_counts.y
		);
		console.log('delete_out_of_view_margin', delete_out_of_view_margin);
		return this._delete_out_of_view(
			core_geo,
			delete_out_of_view_bound_pts,
			delete_out_of_view_margin * 2 // *2 just to be safe
		);
	}

	private _triangle_a = new Triangle();
	private _triangle_b = new Triangle();
	private _point_pos = new Vector3();
	private _delete_out_of_view(
		core_geo: CoreGeometry,
		bound_pts: mapboxgl.LngLat[],
		margin: number
	): BufferGeometry | null {
		const points = core_geo.points();
		const positions = bound_pts.map((bound_pt) => new Vector3(bound_pt.lng, 0, bound_pt.lat));
		this._triangle_a.a.copy(positions[0]);
		this._triangle_a.b.copy(positions[1]);
		this._triangle_a.c.copy(positions[2]);
		this._triangle_b.a.copy(positions[2]);
		this._triangle_b.b.copy(positions[3]);
		this._triangle_b.c.copy(positions[1]);
		CoreMath.expand_triangle(this._triangle_a, margin);
		CoreMath.expand_triangle(this._triangle_b, margin);
		const kept_points: CorePoint[] = [];
		for (let point of points) {
			point.position(this._point_pos);
			if (
				// this._triangle_a.containsPoint(this._point_pos) ||
				this._triangle_b.containsPoint(this._point_pos)
			) {
				kept_points.push(point);
			}
		}
		return CoreGeometry.geometry_from_points(kept_points, ObjectType.MESH);
	}
}

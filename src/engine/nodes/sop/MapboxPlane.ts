/**
 * Creates a plane visible by a mapbox camera.
 *
 * @remarks
 * Note that you will need a mapbox key to use this node.
 */
import {Vector3} from 'three/src/math/Vector3';
import {Vector2} from 'three/src/math/Vector2';
import {PlaneBufferGeometry} from 'three/src/geometries/PlaneBufferGeometry';
import {Matrix4} from 'three/src/math/Matrix4';
import {Box2} from 'three/src/math/Box2';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import mapboxgl from 'mapbox-gl';
import {CoreObject} from '../../../core/geometry/Object';
import {ObjectType} from '../../../core/geometry/Constant';
import {CoreGeometry} from '../../../core/geometry/Geometry';
import {CoreMath} from '../../../core/math/_Module';

import {MapboxListenerParamConfig, MapboxListenerSopNode} from './utils/mapbox/MapboxListener';
import {CoreMapboxTransform} from '../../../core/mapbox/Transform';

// const PSCALE_ATTRIB_NAME = 'pscale'
const SCALE_ATTRIB_NAME = 'scale';
const NORMAL_ATTRIB_NAME = 'normal';
const R_MAT_MAPBOX = new Matrix4().makeRotationAxis(new Vector3(1, 0, 0), -Math.PI * 0.5);
const R_MAT_WORLD = new Matrix4().makeRotationAxis(new Vector3(1, 0, 0), Math.PI * 0.5);

enum MapboxPlaneType {
	PLANE = 'plane',
	HEXAGONS = 'hexagon',
}
const MAPBOX_PLANE_TYPES: Array<MapboxPlaneType> = [MapboxPlaneType.PLANE, MapboxPlaneType.HEXAGONS];

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {MapboxPlaneHexagonsController} from './utils/mapbox/mapbox_plane/HexagonsController';
// import { MapboxPlaneFrustumController } from "./utils/mapbox_plane/OutofViewController";
// update_always_allowed: true,
// use_zoom: true
class MapboxPlaneSopParamsConfig extends MapboxListenerParamConfig(NodeParamsConfig) {
	/** @param type of plane (grid or hexagons) */
	type = ParamConfig.INTEGER(0, {
		menu: {
			entries: MAPBOX_PLANE_TYPES.map((name, i) => {
				return {name: name, value: i};
			}),
		},
	});
	/** @param plane resolution */
	resolution = ParamConfig.INTEGER(10, {
		range: [1, 20],
		range_locked: [true, false],
	});
	/** @param multiplies the size of the plane. This can be useful to scale down the plane. While it would cover a smaller part of the view, it would be faster to create  */
	size_mult = ParamConfig.FLOAT(1, {
		range: [0, 1],
		range_locked: [true, false],
	});
	/** @param toggle on to make sure the plane will cover the full view */
	full_view = ParamConfig.BOOLEAN(1);
	// delete_out_of_view = ParamConfig.BOOLEAN(1);
	/** @param do not create polygons, only points */
	as_points = ParamConfig.BOOLEAN(0, {
		visible_if: {
			type: MAPBOX_PLANE_TYPES.indexOf(MapboxPlaneType.PLANE),
		},
	});
	/** @param creates within mapbox camera space */
	mapbox_transform = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new MapboxPlaneSopParamsConfig();

export class MapboxPlaneSopNode extends MapboxListenerSopNode<MapboxPlaneSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'mapbox_plane';
	}
	private _hexagons_controller = new MapboxPlaneHexagonsController(this);
	// private _frustum_controller = new MapboxPlaneFrustumController(this);

	// private _param_type: number;
	// private _param_resolution: number;
	// private _param_size_mult: number;
	// private _param_full_view: boolean;
	// private _param_delete_out_of_view: boolean;
	// private _param_as_points: boolean;
	// private _param_mapbox_transform: boolean;
	cook() {
		this._mapbox_listener.cook();
	}

	_post_init_controller() {
		const geometry = this._build_plane();
		if (geometry) {
			let type: ObjectType = ObjectType.MESH;
			if (this.pv.as_points || this._as_hexagons()) {
				type = ObjectType.POINTS;
			}
			const object = this.create_object(geometry, type);

			const core_object = new CoreObject(object, 0);
			core_object.add_attribute('mapbox_sw', this.pv.south_west);
			core_object.add_attribute('mapbox_ne', this.pv.north_east);

			this.set_object(object);
		}
	}

	_build_plane() {
		if (!this._camera_node) {
			return;
		}
		const map_center = this._camera_node.center();
		if (!map_center) {
			this.states.error.set('map is not yet loaded');
			return;
		}
		const transformer = new CoreMapboxTransform(this._camera_node);
		const mapbox_center_3d = new Vector3(map_center.lng, 0, map_center.lat);
		transformer.transform_position_FINAL(mapbox_center_3d);
		const mapbox_center = new Vector2(mapbox_center_3d.x, mapbox_center_3d.z);

		const vertical_far_lng_lat_points = this._camera_node.vertical_far_lng_lat_points();
		const vertical_near_lng_lat_points = this._camera_node.vertical_near_lng_lat_points();
		const lng_lat_points = this.pv.full_view ? vertical_far_lng_lat_points : vertical_near_lng_lat_points;

		if (!lng_lat_points) {
			return;
		}
		//
		//
		// we mirror the requested points from the map center, to know how much of the map we cover
		//
		//
		const mirrored_near_lng_lat_points = lng_lat_points.map((p) => this._mirror_lng_lat(p, map_center));
		lng_lat_points.push(map_center);
		mirrored_near_lng_lat_points.forEach((p) => {
			lng_lat_points.push(p);
		});
		const box = new Box2();
		for (let p of lng_lat_points) {
			box.expandByPoint(new Vector2(p.lng, p.lat));
		}

		//
		//
		// get mapbox box
		//
		//
		const mapbox_box = new Box2();
		for (let p of lng_lat_points) {
			const pt3d = new Vector3(p.lng, 0, p.lat);
			transformer.transform_position_FINAL(pt3d);
			mapbox_box.expandByPoint(new Vector2(pt3d.x, pt3d.z));
		}
		const mapbox_dimensions = new Vector2();
		mapbox_box.getSize(mapbox_dimensions);

		//
		//
		// get visible distance
		//
		//
		const horizontal_lng_lat_points = this._camera_node.horizontal_lng_lat_points();
		if (!horizontal_lng_lat_points) {
			return;
		}
		const mapbox_horizontal_lng_lat_points = horizontal_lng_lat_points.map((p) => {
			const pt3d = new Vector3(p.lng, 0, p.lat);
			transformer.transform_position_FINAL(pt3d);
			return {lng: pt3d.x, lat: pt3d.z};
		});
		const mapbox_horizontal_distances = {
			lng: Math.abs(mapbox_horizontal_lng_lat_points[0].lng - mapbox_horizontal_lng_lat_points[1].lng),
			lat: Math.abs(mapbox_horizontal_lng_lat_points[0].lat - mapbox_horizontal_lng_lat_points[1].lat),
		};
		const mapbox_horizontal_distance = Math.sqrt(
			mapbox_horizontal_distances.lng * mapbox_horizontal_distances.lng +
				mapbox_horizontal_distances.lat * mapbox_horizontal_distances.lat
		);
		const mapbox_segment_size = mapbox_horizontal_distance / this.pv.resolution;

		//
		//
		//
		//
		// Segments count should always be a multiple of 2
		// to ensure that we always have a point in the center.
		// Otherwise, we would just from having a point in the center to not having one on every move,
		// which is jarring
		const segments_counts = {
			x: CoreMath.highest_even(this.pv.size_mult * Math.ceil(mapbox_dimensions.x / mapbox_segment_size)),
			y: CoreMath.highest_even(this.pv.size_mult * Math.ceil(mapbox_dimensions.y / mapbox_segment_size)),
		};
		mapbox_dimensions.x = segments_counts.x * mapbox_segment_size;
		mapbox_dimensions.y = segments_counts.y * mapbox_segment_size;

		//
		//
		// untransform mapbox
		//
		//
		// untransforming is a way to find the world pos
		// as we've done every operation before in mapbox space
		const mapbox_box_untransformed = new Box2();
		const mapbox_corners = [
			mapbox_center.clone().sub(mapbox_dimensions.clone().multiplyScalar(0.5)),
			mapbox_center.clone().sub(mapbox_dimensions.clone().multiplyScalar(-0.5)),
			mapbox_center.clone().add(mapbox_dimensions.clone().multiplyScalar(0.5)),
			mapbox_center.clone().add(mapbox_dimensions.clone().multiplyScalar(-0.5)),
		];
		mapbox_corners.forEach((p) => {
			const untransformed_3d = transformer.untransform_position_FINAL(new Vector3(p.x, 0, p.y));
			const untransformed = new Vector2(untransformed_3d.x, untransformed_3d.z);
			// const retransformed = transformer.transform_position_FINAL(new Vector3(untransformed.x, 0, untransformed.y))
			mapbox_box_untransformed.expandByPoint(untransformed);
		});
		const world_dimensions = new Vector2();
		mapbox_box_untransformed.getSize(world_dimensions);

		//
		//
		// round mapbox center to sense the grid is not moving, but we display a section of the world
		// NOTE: this may not be possible, due to having to the projections/transformations required
		//
		//
		// const world_segment_sizes = {
		// 	x: (world_dimensions.x / segments_counts.x),
		// 	y: (world_dimensions.y / segments_counts.y)
		// }
		const world_plane_center = new Vector2(map_center.lng, map_center.lat);
		// const map_center_transformed = transformer.transform_position_FINAL(new Vector3(world_plane_center.x, 0, world_plane_center.y))
		// world_plane_center.x = CoreMath.round(world_plane_center.x, world_segment_sizes.x)
		// world_plane_center.y = CoreMath.round(world_plane_center.y, world_segment_sizes.y) //world_segment_sizes.y * Math.floor(world_plane_center.y / world_segment_sizes.y)
		// const segments_count = Math.max(segments_counts.x, segments_counts.y)
		// const mapbox_segments_count = Math.max(mapbox_segments_counts.x, mapbox_segments_counts.y)

		//
		//
		// create geometries
		//
		//
		const horizontal_scale = mapbox_dimensions.x / segments_counts.x;
		let core_geo;
		const plane_dimensions = this.pv.mapbox_transform ? mapbox_dimensions : world_dimensions;
		const rotation_matrix = this.pv.mapbox_transform ? R_MAT_MAPBOX : R_MAT_WORLD;
		const geometry_center = this.pv.mapbox_transform ? mapbox_center : world_plane_center;

		let geometry: BufferGeometry;
		if (this._as_hexagons()) {
			geometry = this._hexagons_controller.geometry(plane_dimensions, segments_counts);
		} else {
			geometry = new PlaneBufferGeometry(
				plane_dimensions.x,
				plane_dimensions.y,
				segments_counts.x,
				segments_counts.y
			);
		}

		// rotate and translate to expected center
		geometry.applyMatrix4(rotation_matrix);
		geometry.translate(geometry_center.x, 0, geometry_center.y);

		// add attributes scale and normal
		core_geo = new CoreGeometry(geometry);
		const z_scale = [horizontal_scale, 1][0];
		const scale: Number3 = [horizontal_scale, horizontal_scale, z_scale];
		core_geo.add_numeric_attrib(SCALE_ATTRIB_NAME, 3, scale);
		core_geo.add_numeric_attrib(NORMAL_ATTRIB_NAME, 3, [0, 1, 0]); // mostly important for hexagons points

		//
		//
		// if delete out of view
		//
		//
		// not yet working. I suspect that the margin is too high, and is in the wrong coordinate
		// (in mapbox or world, but should be in the other)
		// if (this.pv.delete_out_of_view) {
		// 	const reconstructed_geo = this._frustum_controller.delete_out_of_view(
		// 		geometry,
		// 		core_geo,
		// 		this._camera_node,
		// 		transformer,
		// 		plane_dimensions,
		// 		segments_counts
		// 	);
		// 	if (reconstructed_geo) {
		// 		geometry = reconstructed_geo;
		// 	}
		// }

		return geometry;
	}

	private _mirror_lng_lat(p: mapboxgl.LngLat, map_center: mapboxgl.LngLat) {
		const delta = {
			lng: map_center.lng - p.lng,
			lat: map_center.lat - p.lat,
		};
		return new mapboxgl.LngLat(map_center.lng + delta.lng, map_center.lat + delta.lat);
	}
	private _as_hexagons(): boolean {
		return this.pv.type == MAPBOX_PLANE_TYPES.indexOf(MapboxPlaneType.HEXAGONS);
	}
}

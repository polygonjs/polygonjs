/**
 * Creates a plane visible by a mapbox camera.
 *
 * @remarks
 *
 * See [sop/mapboxCamera](/docs/nodes/sop/mapboxCamera) for info on how to setup mapbox to use with Polygonjs
 *
 */
import {BufferGeometry, Box2, Mesh, Matrix4, Vector2, Vector3, PlaneGeometry} from 'three';
import mapboxgl from 'mapbox-gl';
import {ObjectType} from '../../../core/geometry/Constant';
import {CoreMath} from '../../../core/math/_Module';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {MapboxPlaneHexagonsController} from '../../../core/thirdParty/Mapbox/plane/HexagonsController';
import {Number3} from '../../../types/GlobalTypes';
import {isBooleanTrue} from '../../../core/Type';
import {MapboxMapsController} from '../../../core/thirdParty/Mapbox/MapboxMapsController';
import {CoreMapboxTransform} from '../../../core/thirdParty/Mapbox/Transform';
import {TypedSopNode} from './_Base';
import {CoreMapboxUtils} from '../../../core/thirdParty/Mapbox/Utils';
import {ThreejsPoint} from '../../../core/geometry/modules/three/ThreejsPoint';

const dummyMesh = new Mesh();
// const PSCALE_ATTRIB_NAME = 'pscale'
const SCALE_ATTRIB_NAME = 'scale';
const NORMAL_ATTRIB_NAME = 'normal';
// const R_MAT_MAPBOX = new Matrix4().makeRotationAxis(new Vector3(1, 0, 0), -Math.PI * 0.5);
const R_MAT_WORLD = new Matrix4().makeRotationAxis(new Vector3(1, 0, 0), Math.PI * 0.5);

enum MapboxPlaneType {
	PLANE = 'plane',
	HEXAGONS = 'hexagon',
}
const MAPBOX_PLANE_TYPES: Array<MapboxPlaneType> = [MapboxPlaneType.PLANE, MapboxPlaneType.HEXAGONS];

const _mapCenter3D = new Vector3();
const _mapCenter2D = new Vector2();
// import { MapboxPlaneFrustumController } from "./utils/mapbox_plane/OutofViewController";
// update_always_allowed: true,
// use_zoom: true
class MapboxPlaneSopParamsConfig extends NodeParamsConfig {
	/** @param camera lng lat */
	// lngLat = ParamConfig.VECTOR2([0, 0]);
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
		rangeLocked: [true, false],
	});
	/** @param multiplies the size of the plane. This can be useful to scale down the plane. While it would cover a smaller part of the view, it would be faster to create  */
	sizeMult = ParamConfig.FLOAT(1, {
		range: [0, 1],
		rangeLocked: [true, false],
	});
	/** @param toggle on to make sure the plane will cover the full view */
	fullView = ParamConfig.BOOLEAN(1);
	// delete_out_of_view = ParamConfig.BOOLEAN(1);
	/** @param do not create polygons, only points */
	asPoints = ParamConfig.BOOLEAN(0, {
		visibleIf: {
			type: MAPBOX_PLANE_TYPES.indexOf(MapboxPlaneType.PLANE),
		},
	});
	/** @param creates within mapbox camera space */
	// mapboxTransform = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new MapboxPlaneSopParamsConfig();

export class MapboxPlaneSopNode extends TypedSopNode<MapboxPlaneSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'mapboxPlane';
	}
	private _hexagonsController = new MapboxPlaneHexagonsController();
	private transformer = new CoreMapboxTransform();

	override async cook() {
		const map = await MapboxMapsController.waitForMap();
		if (!map) {
			this.states.error.set('map not initialized yet');
			return;
		}
		// const bounds = map.getBounds()
		// const southWest=bounds.getSouthWest()
		// const northEast=bounds.getNorthEast()

		const geometry = this._buildPlane(map);
		if (geometry) {
			let type: ObjectType = ObjectType.MESH;
			if (isBooleanTrue(this.pv.asPoints) || this._asHexagons()) {
				type = ObjectType.POINTS;
			}
			const object = this.createObject(geometry, type);

			// const coreObject = new CoreObject(object, 0);
			// coreObject.addAttribute('mapbox_sw', southWest);
			// coreObject.addAttribute('mapbox_ne', northEast);

			this.setObject(object);
		}
	}

	_buildPlane(map: mapboxgl.Map) {
		// if (!this._cameraNode) {
		// 	return;
		// }
		// const map_center = this._cameraNode.center();
		// if (!map_center) {
		// 	this.states.error.set('map is not yet loaded');
		// 	return;
		// }
		const center = map.getCenter();
		this.transformer.setLngLat(center);

		_mapCenter3D.set(center.lng, 0, center.lat);
		_mapCenter2D.set(center.lng, center.lat);
		this.transformer.transform_position_FINAL(_mapCenter3D);

		const vertical_far_lng_lat_points = CoreMapboxUtils.verticalFarLngLatPoints(map);
		const vertical_near_lng_lat_points = CoreMapboxUtils.verticalNearLngLatPoints(map);
		const lng_lat_points = this.pv.fullView ? vertical_far_lng_lat_points : vertical_near_lng_lat_points;

		if (!lng_lat_points) {
			return;
		}
		//
		//
		// we mirror the requested points from the map center, to know how much of the map we cover
		//
		//
		const mirrored_near_lng_lat_points = lng_lat_points.map((p) => this._mirrorLngLat(p, center));
		lng_lat_points.push(center);
		for (const p of mirrored_near_lng_lat_points) {
			lng_lat_points.push(p);
		}
		const box = new Box2();
		for (const p of lng_lat_points) {
			box.expandByPoint(new Vector2(p.lng, p.lat));
		}

		//
		//
		// get mapbox box
		//
		//
		const mapbox_box = new Box2();
		for (const p of lng_lat_points) {
			const pt3d = new Vector3(p.lng, 0, p.lat);
			this.transformer.transform_position_FINAL(pt3d);
			mapbox_box.expandByPoint(new Vector2(pt3d.x, pt3d.z));
		}
		const mapbox_dimensions = new Vector2();
		mapbox_box.getSize(mapbox_dimensions);

		//
		//
		// get visible distance
		//
		//
		const horizontal_lng_lat_points = CoreMapboxUtils.horizontalLngLatPoints(map);
		if (!horizontal_lng_lat_points) {
			return;
		}
		const mapbox_horizontal_lng_lat_points = horizontal_lng_lat_points.map((p: mapboxgl.LngLat) => {
			const pt3d = new Vector3(p.lng, 0, p.lat);
			this.transformer.transform_position_FINAL(pt3d);
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
			x: CoreMath.highestEven(this.pv.sizeMult * Math.ceil(mapbox_dimensions.x / mapbox_segment_size)),
			y: CoreMath.highestEven(this.pv.sizeMult * Math.ceil(mapbox_dimensions.y / mapbox_segment_size)),
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
			_mapCenter2D.clone().sub(mapbox_dimensions.clone().multiplyScalar(0.5)),
			_mapCenter2D.clone().sub(mapbox_dimensions.clone().multiplyScalar(-0.5)),
			_mapCenter2D.clone().add(mapbox_dimensions.clone().multiplyScalar(0.5)),
			_mapCenter2D.clone().add(mapbox_dimensions.clone().multiplyScalar(-0.5)),
		];
		for (const p of mapbox_corners) {
			const untransformed_3d = this.transformer.untransform_position_FINAL(new Vector3(p.x, 0, p.y));
			const untransformed = new Vector2(untransformed_3d.x, untransformed_3d.z);
			// const retransformed = transformer.transform_position_FINAL(new Vector3(untransformed.x, 0, untransformed.y))
			mapbox_box_untransformed.expandByPoint(untransformed);
		}
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
		const world_plane_center = new Vector2(center.lng, center.lat);
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
		// const plane_dimensions = this.pv.mapboxTransform ? mapbox_dimensions : world_dimensions;
		// const rotation_matrix = this.pv.mapboxTransform ? R_MAT_MAPBOX : R_MAT_WORLD;
		// const geometry_center = this.pv.mapboxTransform ? _mapCenter2D : world_plane_center;
		const plane_dimensions = world_dimensions;
		const rotation_matrix = R_MAT_WORLD;
		const geometry_center = world_plane_center;

		let geometry: BufferGeometry;
		if (this._asHexagons()) {
			geometry = this._hexagonsController.geometry(plane_dimensions, segments_counts, false);
		} else {
			geometry = new PlaneGeometry(plane_dimensions.x, plane_dimensions.y, segments_counts.x, segments_counts.y);
			geometry.applyMatrix4(rotation_matrix);
		}

		// rotate and translate to expected center

		geometry.translate(geometry_center.x, 0, geometry_center.y);

		// add attributes scale and normal
		const z_scale = [horizontal_scale, 1][0];
		const scale: Number3 = [horizontal_scale, horizontal_scale, z_scale];
		dummyMesh.geometry = geometry;
		const corePointClass = ThreejsPoint;
		corePointClass.addNumericAttribute(dummyMesh, SCALE_ATTRIB_NAME, 3, scale);
		corePointClass.addNumericAttribute(dummyMesh, NORMAL_ATTRIB_NAME, 3, [0, 1, 0]); // mostly important for hexagons points

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

	private _mirrorLngLat(p: mapboxgl.LngLat, map_center: mapboxgl.LngLat) {
		const delta = {
			lng: map_center.lng - p.lng,
			lat: map_center.lat - p.lat,
		};
		return new mapboxgl.LngLat(map_center.lng + delta.lng, map_center.lat + delta.lat);
	}
	private _asHexagons(): boolean {
		return this.pv.type == MAPBOX_PLANE_TYPES.indexOf(MapboxPlaneType.HEXAGONS);
	}
}

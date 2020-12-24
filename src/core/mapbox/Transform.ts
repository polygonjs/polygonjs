import {Vector3} from 'three/src/math/Vector3';
import {Matrix4} from 'three/src/math/Matrix4';
import {LinearInterpolant} from 'three/src/math/interpolants/LinearInterpolant';
import {Group} from 'three/src/objects/Group';
import {Object3D} from 'three/src/core/Object3D';

import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {Mesh} from 'three/src/objects/Mesh';
import {Box3} from 'three/src/math/Box3';

import {CoreGroup} from '../geometry/Group';
import {CoreGeometry} from '../geometry/Geometry';
// import {Constants} from './Constants'
import {CoreMapboxUtils} from './Utils';
import {MapboxCameraObjNode} from '../../engine/nodes/obj/MapboxCamera';
import mapboxgl from 'mapbox-gl';
const Utils = CoreMapboxUtils;

const MAT_RX = new Matrix4().makeRotationAxis(new Vector3(1, 0, 0), -Math.PI / 2);
const POSITION_ATTRIB_NAME = 'position';

const STEP_SIZE_BY_ZOOM: Dictionary<number> = {
	1: 1802297.1652004332,
	2: 901148.582600187,
	3: 450574.29129994207,
	4: 225287.14564998331,
	5: 112643.57282498456,
	6: 56321.78641249478,
	7: 28160.89320639847,
	8: 14080.446603198769,
	9: 7040.223301600898,
	10: 3520.1116506467515,
	11: 1760.0558254750213,
	12: 880.027912584861,
	13: 440.01395644506556,
	14: 220.00697807141114,
	15: 110.00348918733653,
	16: 55.0017445946869,
	17: 27.50087214470841,
	18: 13.750436073372839,
	19: 6.8752180371957365,
	20: 3.437609169195639,
	21: 1.7188044319627807,
	22: 0.8594022154866252,
	23: 0.42970126142608933,
};

export class CoreMapboxTransform {
	static WORLD_SCALE = 5.41843220338983e-8;

	private pos_offset: [number, number];

	constructor(private _camera_node: MapboxCameraObjNode) {
		const lng_lat = this._camera_node.pv.lng_lat;
		const lng_lat_start = {
			lng: lng_lat.x,
			lat: lng_lat.y,
		};
		this.pos_offset = Utils.fromLL(lng_lat_start.lng, lng_lat_start.lat);
	}

	// transform_geometry(geometry: BufferGeometry) {
	// 	const max_ratio = this.geometry_bbox_ratio(geometry);
	// 	this.transform_geometry_with_max_ratio(geometry, max_ratio);
	// }

	transform_group2(group: Group) {
		const core_group = new CoreGroup();
		core_group.set_objects(group.children);
		const center = core_group.center();
		const bbox = core_group.bounding_box();
		const size = core_group.size();

		const new_center = Utils.fromLLv(center);
		const new_min = Utils.fromLLv(bbox.min);
		const new_max = Utils.fromLLv(bbox.max);

		const new_size = new_max.clone().sub(new_min);

		// const tr_offset = center.clone().sub(new_center)
		const s_offset = size.clone().multiply(new_size);
		s_offset.x = Math.abs(s_offset.x);
		s_offset.z = Math.abs(s_offset.z);
		s_offset.y = 0.5 * (s_offset.x + s_offset.z);

		const mat_tr = new Matrix4();
		const mat_tr_reset = new Matrix4();
		const mat_s = new Matrix4();
		mat_tr_reset.makeTranslation(-center.x, -center.y, -center.z);
		mat_tr.makeTranslation(new_center.x - this.pos_offset[0], new_center.y, new_center.z - this.pos_offset[1]);
		mat_s.makeScale(s_offset.x, s_offset.y, s_offset.z);

		group.traverse((object) => {
			const geometry = (object as Mesh).geometry as BufferGeometry;

			if (geometry) {
				geometry.applyMatrix4(mat_tr_reset);
				geometry.applyMatrix4(mat_s);
				geometry.applyMatrix4(mat_tr);
				// this.transform_geometry_with_max_ratio(geometry, max_ratio)

				geometry.applyMatrix4(MAT_RX);
				if (geometry.attributes.normal) {
					geometry.computeVertexNormals();
				}
			}
		});
	}

	transform_group_FINAL(object: Object3D) {
		this.transform_group3(object);
	}
	transform_geometry_FINAL(geometry: BufferGeometry) {
		this.transform_geometry3(geometry);
	}
	transform_position_FINAL(position: Vector3): Vector3 {
		return this.transform_position3(position);
	}
	untransform_position_FINAL(position: Vector3): Vector3 {
		return this.untransform_position3(position);
	}

	transform_group3(group: Object3D) {
		// const max_ratio = this.group_bbox_ratio(group);

		group.traverse((object) => {
			const geometry = (object as Mesh).geometry as BufferGeometry;
			if (geometry) {
				this.transform_geometry_FINAL(geometry);
			}
		});
	}

	transform_group(group: Group) {
		const max_ratio = this.group_bbox_ratio(group);

		group.traverse((object) => {
			const geometry = (object as Mesh).geometry as BufferGeometry;
			if (geometry) {
				this.transform_geometry_with_max_ratio(geometry, max_ratio);
			}
		});
	}
	// transform_positions(positions: Vector3[]){
	// 	const min = new Vector3(
	// 		ArrayUtils.min(positions.map(v=>v.x)),
	// 		ArrayUtils.min(positions.map(v=>v.y)),
	// 		ArrayUtils.min(positions.map(v=>v.z))
	// 	)
	// 	const max = new Vector3(
	// 		ArrayUtils.max(positions.map(v=>v.x)),
	// 		ArrayUtils.max(positions.map(v=>v.y)),
	// 		ArrayUtils.max(positions.map(v=>v.z))
	// 	)
	// 	const bbox = new Box3(min, max)
	// 	const max_ratio = this.bbox_ratio(bbox)
	// 	positions.forEach(position=>{
	// 		this.transform_position_with_max_ratio(position, max_ratio)
	// 	})
	// }
	private transform_geometry3(geometry: BufferGeometry) {
		const geometry_wrapper = new CoreGeometry(geometry);
		const points = geometry_wrapper.points();
		points.forEach((point) => {
			const position = point.position();
			this.transform_position_FINAL(position);
			point.set_attrib_value(POSITION_ATTRIB_NAME, position);
		});

		// geometry.applyMatrix(MAT_RX);
		// geometry.computeVertexNormals(); // this messes up when transforming points
	}

	private transform_geometry_with_max_ratio(geometry: BufferGeometry, max_ratio: number) {
		const geometry_wrapper = new CoreGeometry(geometry);
		const points = geometry_wrapper.points();
		points.forEach((point) => {
			const position = point.position();
			this.transform_position_with_max_ratio(position, max_ratio);
			point.set_attrib_value(POSITION_ATTRIB_NAME, position);
		});

		geometry.applyMatrix4(MAT_RX);
		if (geometry.attributes.normal) {
			geometry.computeVertexNormals();
		}
	}
	private transform_position3(position: Vector3): Vector3 {
		const lon = position.x;
		const altitude = position.y;
		const lat = position.z;
		// const pos = Utils.fromLL(lon, lat);
		const mercator_pos = mapboxgl.MercatorCoordinate.fromLngLat([lon, lat], altitude);
		position.x = mercator_pos.x - this.pos_offset[0];
		position.y = mercator_pos.z || 0;
		// position.y *= -max_ratio;
		position.z = mercator_pos.y - this.pos_offset[1];

		position.divideScalar(CoreMapboxTransform.WORLD_SCALE);
		return position;
	}
	private untransform_position3(position: Vector3): Vector3 {
		position.multiplyScalar(CoreMapboxTransform.WORLD_SCALE);

		const lon = position.x + this.pos_offset[0];
		const altitude = position.y;
		const lat = position.z + this.pos_offset[1];
		// const pos = Utils.fromLL(lon, lat);
		const mercator = new mapboxgl.MercatorCoordinate(lon, lat, altitude);
		const lng_lat_like = mercator.toLngLat();
		position.x = lng_lat_like.lng;
		position.y = altitude;
		// position.y *= -max_ratio;
		position.z = lng_lat_like.lat;

		return position;
	}
	private transform_position_with_max_ratio(position: Vector3, max_ratio: number) {
		const lon = position.x;
		const lat = position.z;
		const pos = Utils.fromLL(lon, lat);
		position.x = pos[0] - this.pos_offset[0];
		position.y *= -max_ratio;
		position.z = pos[1] - this.pos_offset[1];
	}

	private group_bbox_ratio(group: Group): number {
		const core_group = new CoreGroup();
		core_group.set_objects(group.children);
		const bbox = core_group.bounding_box();
		return this.bbox_ratio(bbox);
	}
	// private geometry_bbox_ratio(geometry: BufferGeometry): number {
	// 	geometry.computeBoundingBox();
	// 	return geometry.boundingBox;
	// }

	private bbox_ratio(bbox: Box3): number {
		const new_bbox_min = Utils.fromLL(bbox.min.x, bbox.min.z);
		const new_bbox_max = Utils.fromLL(bbox.max.x, bbox.max.z);
		const new_bbox_size = [new_bbox_max[1] - new_bbox_min[1], new_bbox_max[0] - new_bbox_min[0]];
		const old_bbox_size = [bbox.max.x - bbox.min.x, bbox.max.z - bbox.min.z];
		const bbox_ratio = [new_bbox_size[0] / old_bbox_size[0], new_bbox_size[1] / old_bbox_size[1]];
		return Math.max(bbox_ratio[0], bbox_ratio[1]);
	}

	//
	//
	// ZOOM INTERPOLANT
	//
	//
	private static _interpolant: LinearInterpolant | undefined;
	static _step_size_from_zoom_interpolant() {
		return (this._interpolant = this._interpolant || this._create_step_size_from_zoom_interpolant());
	}
	static _create_step_size_from_zoom_interpolant() {
		const positions = Object.keys(STEP_SIZE_BY_ZOOM)
			.map((p) => parseFloat(p))
			.sort();
		const values = [];
		for (let position of positions) {
			values.push(STEP_SIZE_BY_ZOOM[position]);
		}

		const values_count = 1;
		const interpolated_values = new Float32Array(values_count);
		return new LinearInterpolant(positions, values, values_count, interpolated_values);
	}
	static step_size_from_zoom(zoom: number): number {
		return this._step_size_from_zoom_interpolant().evaluate(zoom)[0];
	}
}

/// <reference path="../../custom_typings/math.d.ts" />

import {Vector3} from 'three/src/math/Vector3';
import {Quaternion} from 'three/src/math/Quaternion';
import {Object3D} from 'three/src/core/Object3D';
import {Matrix4} from 'three/src/math/Matrix4';
import {Euler} from 'three/src/math/Euler';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {MathUtils} from 'three/src/math/MathUtils';

import {BaseNodeType} from '../engine/nodes/_Base';

export enum RotationOrder {
	XYZ = 'XYZ',
	XZY = 'XZY',
	YXZ = 'YXZ',
	YZX = 'YZX',
	ZYX = 'ZYX',
	ZXY = 'ZXY',
}
export const ROTATION_ORDERS: RotationOrder[] = [
	RotationOrder.XYZ,
	RotationOrder.XZY,
	RotationOrder.YXZ,
	RotationOrder.YZX,
	RotationOrder.ZYX,
	RotationOrder.ZXY,
];
export const DEFAULT_ROTATION_ORDER = RotationOrder.XYZ;

export interface SetParamsFromMatrixOptions {
	scale?: boolean;
}

export class CoreTransform {
	private static set_params_from_matrix_position = new Vector3();
	private static set_params_from_matrix_quaternion = new Quaternion();
	private static set_params_from_matrix_scale = new Vector3();
	private static set_params_from_matrix_euler = new Euler();
	private static set_params_from_matrix_rotation = new Vector3();
	private static set_params_from_matrix_t: Number3 = [0, 0, 0];
	private static set_params_from_matrix_r: Number3 = [0, 0, 0];
	private static set_params_from_matrix_s: Number3 = [0, 0, 0];
	static set_params_from_matrix(matrix: Matrix4, node: BaseNodeType, options: SetParamsFromMatrixOptions = {}) {
		let update_scale = options['scale'];
		if (update_scale == null) {
			update_scale = true;
		}

		// EPSILON = 0.0000001
		// PRECISION = 1000
		// components = ['x', 'y', 'z']

		matrix.decompose(
			this.set_params_from_matrix_position,
			this.set_params_from_matrix_quaternion,
			this.set_params_from_matrix_scale
		);

		this.set_params_from_matrix_euler.setFromQuaternion(this.set_params_from_matrix_quaternion);
		this.set_params_from_matrix_euler.toVector3(this.set_params_from_matrix_rotation);
		this.set_params_from_matrix_rotation.divideScalar(Math.PI / 180);

		// limit precision of position and rotation
		// lodash_each [position, rotation], (vector)->
		// 	lodash_each ['x', 'y', 'z'], (c)->
		// 		val = vector[c]
		// 		approximation = parseInt(val * PRECISION) / PRECISION
		// 		vector[c] = approximation

		// round scale if we get values like 0.9999999999 or 1.00000000001
		// lodash_each ['x', 'y', 'z'], (c)->
		// 	val = scale[c]
		// 	rounded = Math.round(val)
		// 	if Math.abs(val - rounded) < EPSILON
		// 		scale[c] = rounded
		this.set_params_from_matrix_position.toArray(this.set_params_from_matrix_t);
		this.set_params_from_matrix_rotation.toArray(this.set_params_from_matrix_r);
		this.set_params_from_matrix_scale.toArray(this.set_params_from_matrix_s);

		node.scene.batch_update(() => {
			node.params.set_vector3('t', this.set_params_from_matrix_t);
			node.params.set_vector3('r', this.set_params_from_matrix_r);
			node.params.set_vector3('s', this.set_params_from_matrix_s);
			if (update_scale) {
				node.params.set_float('scale', 1);
			}
		});
	}
	// this.object().position.copy(position)
	// this.object().quaternion.copy(quaternion)
	// this.object().scale.copy(scale)

	static set_params_from_object_position_array: Number3 = [0, 0, 0];
	static set_params_from_object_rotation_deg = new Vector3();
	static set_params_from_object_rotation_array: Number3 = [0, 0, 0];
	static set_params_from_object(object: Object3D, node: BaseNodeType) {
		object.position.toArray(this.set_params_from_object_position_array);

		object.rotation.toArray(this.set_params_from_object_rotation_array);
		this.set_params_from_object_rotation_deg.fromArray(this.set_params_from_object_rotation_array);
		this.set_params_from_object_rotation_deg.multiplyScalar(180 / Math.PI);
		this.set_params_from_object_rotation_deg.toArray(this.set_params_from_object_rotation_array);

		node.scene.batch_update(() => {
			node.params.set_vector3('t', this.set_params_from_object_position_array);
			node.params.set_vector3('r', this.set_params_from_object_rotation_array);
		});
	}

	// static translation_matrix(x: number, y: number, z: number): Matrix4 {
	// 	const t = new Vector3(x, y, z);
	// 	const quaternion = new Quaternion();
	// 	const s = new Vector3(1, 1, 1);

	// 	const matrix = new Matrix4();
	// 	matrix.compose(t, quaternion, s);
	// 	return matrix;
	// }

	private _translation_matrix: Matrix4 = new Matrix4();
	private _translation_matrix_q = new Quaternion();
	private _translation_matrix_s = new Vector3(1, 1, 1);
	translation_matrix(t: Vector3): Matrix4 {
		this._translation_matrix.compose(t, this._translation_matrix_q, this._translation_matrix_s);
		return this._translation_matrix;
	}

	// private static matrix_quaternion_t = new Vector3();
	// private static matrix_quaternion_s = new Vector3();
	// static matrix_quaternion(matrix: Matrix4, target_quat: Quaternion): void {
	// 	matrix.decompose(this.matrix_quaternion_t, target_quat, this.matrix_quaternion_s);
	// }

	// static matrix(t: Vector3, r: Vector3, s: Vector3, scale: number) {
	// 	// if I don't clone here, it created issues in the transform SOP
	// 	s = s.clone().multiplyScalar(scale);

	// 	const quaternion = new Quaternion();
	// 	const euler = new Euler(r.x, r.y, r.z, ROTATION_ORDER);
	// 	quaternion.setFromEuler(euler);

	// 	const matrix = new Matrix4();
	// 	matrix.compose(t, quaternion, s);
	// 	return matrix;
	// }
	private _matrix = new Matrix4().identity();
	private _matrix_q = new Quaternion();
	private _matrix_euler = new Euler();
	private _matrix_s = new Vector3();
	matrix(t: Vector3, r: Vector3, s: Vector3, scale: number, rotation_order: RotationOrder) {
		this._matrix_euler.set(
			MathUtils.degToRad(r.x),
			MathUtils.degToRad(r.y),
			MathUtils.degToRad(r.z),
			rotation_order
		);
		this._matrix_q.setFromEuler(this._matrix_euler);

		this._matrix_s.copy(s).multiplyScalar(scale);

		this._matrix.compose(t, this._matrix_q, this._matrix_s);
		return this._matrix;
	}

	// static rotate_geometry(geometry: BufferGeometry, vec_origin: Vector3, vec_dest: Vector3) {
	// 	const quaternion = new Quaternion();
	// 	quaternion.setFromUnitVectors(vec_origin, vec_dest.clone().normalize());
	// 	const matrix = new Matrix4();
	// 	matrix.makeRotationFromQuaternion(quaternion);
	// 	geometry.applyMatrix(matrix);
	// }

	private _rotate_geometry_m = new Matrix4();
	private _rotate_geometry_q = new Quaternion();
	private _rotate_geometry_vec_dest = new Vector3();
	rotate_geometry(geometry: BufferGeometry, vec_origin: Vector3, vec_dest: Vector3) {
		this._rotate_geometry_vec_dest.copy(vec_dest);
		this._rotate_geometry_vec_dest.normalize();
		this._rotate_geometry_q.setFromUnitVectors(vec_origin, this._rotate_geometry_vec_dest);
		// this._rotate_geometry_m.identity(); // not entirely sure this is necessary
		this._rotate_geometry_m.makeRotationFromQuaternion(this._rotate_geometry_q);
		geometry.applyMatrix4(this._rotate_geometry_m);
	}
}

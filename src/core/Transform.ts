import {Number3} from '../types/GlobalTypes';
import {Vector3} from 'three';
import {Quaternion} from 'three';
import {Object3D} from 'three';
import {Matrix4} from 'three';
import {Euler} from 'three';
import {BufferGeometry} from 'three';
import {MathUtils} from 'three';

import {BaseNodeType} from '../engine/nodes/_Base';

export enum TransformTargetType {
	OBJECTS = 'objects',
	GEOMETRIES = 'geometries',
}
export const TRANSFORM_TARGET_TYPES: Array<TransformTargetType> = [
	TransformTargetType.GEOMETRIES,
	TransformTargetType.OBJECTS,
];

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
	RotationOrder.ZXY,
	RotationOrder.ZYX,
];
export const DEFAULT_ROTATION_ORDER = RotationOrder.XYZ;

export interface SetParamsFromMatrixOptions {
	scale?: boolean;
}

const eulerArray: Number3 = [0, 0, 0];
export class CoreTransform {
	private static set_params_from_matrix_position = new Vector3();
	private static set_params_from_matrix_quaternion = new Quaternion();
	private static set_params_from_matrix_scale = new Vector3();
	private static set_params_from_matrix_euler = new Euler();
	private static set_params_from_matrix_rotation = new Vector3();
	private static set_params_from_matrix_t: Number3 = [0, 0, 0];
	private static set_params_from_matrix_r: Number3 = [0, 0, 0];
	private static set_params_from_matrix_s: Number3 = [0, 0, 0];
	static setParamsFromMatrix(matrix: Matrix4, node: BaseNodeType, options: SetParamsFromMatrixOptions = {}) {
		let update_scale = options['scale'];
		if (update_scale == null) {
			update_scale = true;
		}

		matrix.decompose(
			this.set_params_from_matrix_position,
			this.set_params_from_matrix_quaternion,
			this.set_params_from_matrix_scale
		);

		this.set_params_from_matrix_euler.setFromQuaternion(this.set_params_from_matrix_quaternion);
		this.set_params_from_matrix_euler.toArray(eulerArray);
		this.set_params_from_matrix_rotation.fromArray(eulerArray);
		this.set_params_from_matrix_rotation.divideScalar(Math.PI / 180);

		this.set_params_from_matrix_position.toArray(this.set_params_from_matrix_t);
		this.set_params_from_matrix_rotation.toArray(this.set_params_from_matrix_r);
		this.set_params_from_matrix_scale.toArray(this.set_params_from_matrix_s);

		node.scene().batchUpdates(() => {
			node.params.set_vector3('t', this.set_params_from_matrix_t);
			node.params.set_vector3('r', this.set_params_from_matrix_r);
			node.params.set_vector3('s', this.set_params_from_matrix_s);
			if (update_scale) {
				node.params.set_float('scale', 1);
			}
		});
	}

	static set_params_from_object_position_array: Number3 = [0, 0, 0];
	static set_params_from_object_rotation_deg = new Vector3();
	static set_params_from_object_rotation_array: Number3 = [0, 0, 0];
	static setParamsFromObject(object: Object3D, node: BaseNodeType) {
		object.position.toArray(this.set_params_from_object_position_array);

		object.rotation.toArray(this.set_params_from_object_rotation_array);
		this.set_params_from_object_rotation_deg.fromArray(this.set_params_from_object_rotation_array);
		this.set_params_from_object_rotation_deg.multiplyScalar(180 / Math.PI);
		this.set_params_from_object_rotation_deg.toArray(this.set_params_from_object_rotation_array);

		node.scene().batchUpdates(() => {
			node.params.set_vector3('t', this.set_params_from_object_position_array);
			node.params.set_vector3('r', this.set_params_from_object_rotation_array);
		});
	}

	private _translation_matrix: Matrix4 = new Matrix4();
	private _translation_matrix_q = new Quaternion();
	private _translation_matrix_s = new Vector3(1, 1, 1);
	translationMatrix(t: Vector3): Matrix4 {
		this._translation_matrix.compose(t, this._translation_matrix_q, this._translation_matrix_s);
		return this._translation_matrix;
	}

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

	private _m = new Matrix4();
	private _q = new Quaternion();
	private _rotateDirOrigin = new Vector3();
	private _rotateDirDest = new Vector3();
	rotateGeometry(geometry: BufferGeometry, dirOrigin: Vector3, dirDest: Vector3) {
		this._rotateDirDest.copy(dirDest).normalize();
		this._rotateDirOrigin.copy(dirOrigin).normalize();
		this._q.setFromUnitVectors(this._rotateDirOrigin, this._rotateDirDest);
		// this._rotate_geometry_m.identity(); // not entirely sure this is necessary
		this._m.makeRotationFromQuaternion(this._q);
		geometry.applyMatrix4(this._m);
	}
	rotateObject(object: Object3D, dirOrigin: Vector3, dirDest: Vector3) {
		this._rotateDirDest.copy(dirDest).normalize();
		this._rotateDirOrigin.copy(dirOrigin).normalize();
		this._q.setFromUnitVectors(this._rotateDirOrigin, this._rotateDirDest);
		// this._rotate_geometry_m.identity(); // not entirely sure this is necessary
		this._m.makeRotationFromQuaternion(this._q);
		object.matrix.multiply(this._m);
		// object.updateMatrix();
		object.matrix.decompose(object.position, object.quaternion, object.scale);
	}

	static decomposeMatrix(object: Object3D) {
		object.matrix.decompose(object.position, object.quaternion, object.scale);
	}
}

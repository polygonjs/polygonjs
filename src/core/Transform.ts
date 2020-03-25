import {Vector3} from 'three/src/math/Vector3';
import {Quaternion} from 'three/src/math/Quaternion';
import {Object3D} from 'three/src/core/Object3D';
import {Matrix4} from 'three/src/math/Matrix4';
import {Euler} from 'three/src/math/Euler';
import {BufferGeometry} from 'three/src/core/BufferGeometry';

import {BaseNodeType} from '../engine/nodes/_Base';

const ROTATION_ORDER = 'XYZ';

export interface SetParamsFromMatrixOptions {
	scale?: boolean;
}

// TODO: remove the "new" in this whole file
// const euler = new Euler(0, 0, 0, ROTATION_ORDER)

export class CoreTransform {
	// static create_params(node: BaseNodeType) {
	// 	node.add_param(ParamType.VECTOR3, 't', [0, 0, 0]);
	// 	node.add_param(ParamType.VECTOR3, 'r', [0, 0, 0]);
	// 	node.add_param(ParamType.VECTOR3, 's', [1, 1, 1]);
	// 	node.add_param(ParamType.FLOAT, 'scale', 1, {range: [0, 10]});
	// 	node.add_param(ParamType.OPERATOR_PATH, 'look_at', '');
	// 	node.add_param(ParamType.VECTOR3, 'up', [0, 1, 0]);
	// }

	// static matrix_from_node_with_transform_params(node: BaseNodeType): Matrix4 {
	// 	const t = node.params.vector3('t');
	// 	const r = node.params
	// 		.vector3('r')
	// 		.clone()
	// 		.multiplyScalar(Math.PI / 180);
	// 	const s = node.params.vector3('s');
	// 	const scale = node.params.float('scale');
	// 	return this.matrix(t, r, s, scale);
	// }

	// if this is done, make sure to use eval with a  callback
	// @matrix_from_params: (node) ->
	// 	t = node.param('t').eval()
	// 	r = node.param('r').eval().multiplyScalar( Math.PI / 180 )
	// 	s = node.param('s').eval()
	// 	scale = node.param('scale').eval()
	// 	this.matrix(t, r, s, scale)

	static set_params_from_matrix(matrix: Matrix4, node: BaseNodeType, options: SetParamsFromMatrixOptions = {}) {
		let update_scale = options['scale'];
		if (update_scale == null) {
			update_scale = true;
		}

		// EPSILON = 0.0000001
		// PRECISION = 1000
		// components = ['x', 'y', 'z']

		const position = new Vector3();
		const quaternion = new Quaternion();
		const scale = new Vector3();
		matrix.decompose(position, quaternion, scale);

		const euler = new Euler().setFromQuaternion(quaternion);
		const rotation = euler.toVector3();
		rotation.divideScalar(Math.PI / 180);

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

		node.scene.batch_update(() => {
			node.params.set_vector3('r', rotation.toArray() as Number3);
			node.params.set_vector3('t', position.toArray() as Number3);
			node.params.set_vector3('s', scale.toArray() as Number3);
			if (update_scale) {
				node.params.set_float('scale', 1);
			}
		});
	}
	// this.object().position.copy(position)
	// this.object().quaternion.copy(quaternion)
	// this.object().scale.copy(scale)

	static set_params_from_object(object: Object3D, node: BaseNodeType) {
		const position = object.position.toArray() as Number3;
		const rotation = object.rotation.toArray().map((c) => c * (180 / Math.PI)) as Number3;

		node.scene.batch_update(() => {
			node.params.set_vector3('t', position);
			node.params.set_vector3('r', rotation);
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

	static matrix_quaternion(matrix: Matrix4): Quaternion {
		const t = new Vector3();
		const quat = new Quaternion();
		const s = new Vector3();
		matrix.decompose(t, quat, s);
		return quat;
	}

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
	private _matrix_e = new Euler();
	private _matrix_s = new Vector3();
	matrix(t: Vector3, r: Vector3, s: Vector3, scale: number) {
		this._matrix_e.set(r.x, r.y, r.z, ROTATION_ORDER);
		this._matrix_q.setFromEuler(this._matrix_e);

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

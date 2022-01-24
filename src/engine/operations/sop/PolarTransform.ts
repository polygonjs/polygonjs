import {BaseSopOperation} from './_Base';
import {CoreGroup, Object3DWithGeometry} from '../../../core/geometry/Group';
import {Vector3} from 'three/src/math/Vector3';
import {Matrix4} from 'three/src/math/Matrix4';
import {Object3D} from 'three/src/core/Object3D';
import {TypeAssert} from '../../../engine/poly/Assert';
import {DefaultOperationParams} from '../_Base';

import {TransformTargetType, TRANSFORM_TARGET_TYPES} from '../../../core/Transform';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {Quaternion} from 'three/src/math/Quaternion';
import {degToRad} from 'three/src/math/MathUtils';

const AXIS_VERTICAL = new Vector3(0, 1, 0);
const AXIS_HORIZONTAL = new Vector3(-1, 0, 0);

interface PolarTransformSopParams extends DefaultOperationParams {
	applyOn: number;
	center: Vector3;
	longitude: number;
	latitude: number;
	depth: number;
}

export class PolarTransformSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: PolarTransformSopParams = {
		applyOn: TRANSFORM_TARGET_TYPES.indexOf(TransformTargetType.GEOMETRIES),
		center: new Vector3(0, 0, 0),
		longitude: 0,
		latitude: 0,
		depth: 1,
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<'polarTransform'> {
		return 'polarTransform';
	}

	override cook(input_contents: CoreGroup[], params: PolarTransformSopParams) {
		const objects = input_contents[0].objects();
		const matrix = this.matrix(params);

		this._apply_transform(objects, params, matrix);

		return input_contents[0];
	}
	private _apply_transform(objects: Object3D[], params: PolarTransformSopParams, matrix: Matrix4) {
		const mode = TRANSFORM_TARGET_TYPES[params.applyOn];
		switch (mode) {
			case TransformTargetType.GEOMETRIES: {
				return this._apply_matrix_to_geometries(objects, matrix);
			}
			case TransformTargetType.OBJECTS: {
				return this._apply_matrix_to_objects(objects, matrix);
			}
		}
		TypeAssert.unreachable(mode);
	}

	private _apply_matrix_to_geometries(objects: Object3D[], matrix: Matrix4) {
		for (let object of objects) {
			const geometry = (object as Object3DWithGeometry).geometry;
			if (geometry) {
				geometry.applyMatrix4(matrix);
			}
		}
	}
	private _apply_matrix_to_objects(objects: Object3D[], matrix: Matrix4) {
		for (let object of objects) {
			matrix.decompose(this._decomposed.t, this._decomposed.q, this._decomposed.s);
			object.position.copy(this._decomposed.t);
			object.quaternion.copy(this._decomposed.q);
			object.scale.copy(this._decomposed.s);
			object.updateMatrix();
		}
	}

	private _centerMatrix = new Matrix4();
	private _longitudeMatrix = new Matrix4();
	private _latitudeMatrix = new Matrix4();
	private _depthMatrix = new Matrix4();
	private _fullMatrix = new Matrix4();
	private _decomposed = {
		t: new Vector3(),
		q: new Quaternion(),
		s: new Vector3(),
	};
	matrix(params: PolarTransformSopParams) {
		this._centerMatrix.identity();
		this._longitudeMatrix.identity();
		this._latitudeMatrix.identity();
		this._depthMatrix.identity();
		this._centerMatrix.makeTranslation(params.center.x, params.center.y, params.center.z);
		this._longitudeMatrix.makeRotationAxis(AXIS_VERTICAL, degToRad(params.longitude));
		this._latitudeMatrix.makeRotationAxis(AXIS_HORIZONTAL, degToRad(params.latitude));
		this._depthMatrix.makeTranslation(0, 0, params.depth);
		this._fullMatrix
			.copy(this._centerMatrix)
			.multiply(this._longitudeMatrix)
			.multiply(this._latitudeMatrix)
			.multiply(this._depthMatrix);

		return this._fullMatrix;
	}
}

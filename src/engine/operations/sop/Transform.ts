import {BaseSopOperation} from './_Base';
import {CoreGroup, Object3DWithGeometry} from '../../../core/geometry/Group';
import {Vector3} from 'three/src/math/Vector3';
import {Object3D} from 'three/src/core/Object3D';
import {TypeAssert} from '../../../engine/poly/Assert';
import {DefaultOperationParams} from '../_Base';

import {
	CoreTransform,
	ROTATION_ORDERS,
	RotationOrder,
	TransformTargetType,
	TRANSFORM_TARGET_TYPES,
} from '../../../core/Transform';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {DEG2RAD} from 'three/src/math/MathUtils';

export enum TransformObjectMode {
	SET_PARAMS = 'set params',
	UPDATE_MATRIX = 'update matrix',
}
export const TRANSFORM_OBJECT_MODES: TransformObjectMode[] = [
	TransformObjectMode.SET_PARAMS,
	TransformObjectMode.UPDATE_MATRIX,
];

interface TransformSopParams extends DefaultOperationParams {
	applyOn: number;
	objectMode: number;
	group: string;
	rotationOrder: number;
	t: Vector3;
	r: Vector3;
	s: Vector3;
	scale: number;
	pivot: Vector3;
}

export class TransformSopOperation extends BaseSopOperation {
	static readonly DEFAULT_PARAMS: TransformSopParams = {
		applyOn: TRANSFORM_TARGET_TYPES.indexOf(TransformTargetType.GEOMETRIES),
		objectMode: TRANSFORM_OBJECT_MODES.indexOf(TransformObjectMode.SET_PARAMS),
		group: '',
		rotationOrder: ROTATION_ORDERS.indexOf(RotationOrder.XYZ),
		t: new Vector3(0, 0, 0),
		r: new Vector3(0, 0, 0),
		s: new Vector3(1, 1, 1),
		scale: 1,
		pivot: new Vector3(0, 0, 0),
	};
	static readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static type(): Readonly<'transform'> {
		return 'transform';
	}

	private _core_transform = new CoreTransform();
	cook(input_contents: CoreGroup[], params: TransformSopParams) {
		const objects = input_contents[0].objects();

		this._applyTransform(objects, params);

		return input_contents[0];
	}
	private _applyTransform(objects: Object3D[], params: TransformSopParams) {
		const mode = TRANSFORM_TARGET_TYPES[params.applyOn];
		switch (mode) {
			case TransformTargetType.GEOMETRIES: {
				return this._updateGeometries(objects, params);
			}
			case TransformTargetType.OBJECTS: {
				return this._updateObjects(objects, params);
			}
		}
		TypeAssert.unreachable(mode);
	}

	private _point_pos = new Vector3();
	private _updateGeometries(objects: Object3D[], params: TransformSopParams) {
		const matrix = this._matrix(params);

		if (params.group.trim() === '') {
			for (let object of objects) {
				const geometry = (object as Object3DWithGeometry).geometry;
				if (geometry) {
					geometry.translate(-params.pivot.x, -params.pivot.y, -params.pivot.z);
					geometry.applyMatrix4(matrix);
					geometry.translate(params.pivot.x, params.pivot.y, params.pivot.z);
				}
			}
		} else {
			const core_group = CoreGroup._fromObjects(objects);
			const points = core_group.pointsFromGroup(params.group);
			for (let point of points) {
				const position = point.getPosition(this._point_pos).sub(params.pivot);
				position.applyMatrix4(matrix);
				point.setPosition(position.add(params.pivot));
			}
		}
	}

	private _updateObjects(objects: Object3D[], params: TransformSopParams) {
		const objectMode = TRANSFORM_OBJECT_MODES[params.objectMode];
		switch (objectMode) {
			case TransformObjectMode.SET_PARAMS: {
				return this._update_objects_params(objects, params);
			}
			case TransformObjectMode.UPDATE_MATRIX: {
				return this._update_objects_matrix(objects, params);
			}
		}
		TypeAssert.unreachable(objectMode);
	}

	private _object_scale = new Vector3();
	private _r = new Vector3();
	private _update_objects_params(objects: Object3D[], params: TransformSopParams) {
		for (let object of objects) {
			object.position.copy(params.t);
			const order = ROTATION_ORDERS[params.rotationOrder];
			this._r.copy(params.r).multiplyScalar(DEG2RAD);
			object.rotation.set(this._r.x, this._r.y, this._r.z, order);
			this._object_scale.copy(params.s).multiplyScalar(params.scale);
			object.scale.copy(this._object_scale);
			object.updateMatrix();
		}
	}

	private _object_position = new Vector3();
	private _update_objects_matrix(objects: Object3D[], params: TransformSopParams) {
		const matrix = this._matrix(params);
		for (let object of objects) {
			// center to origin
			this._object_position.copy(object.position);
			object.position.multiplyScalar(0);
			object.updateMatrix();
			// apply matrix
			object.applyMatrix4(matrix);
			// revert to position
			object.position.add(this._object_position);
			object.updateMatrix();
		}
	}

	private _matrix(params: TransformSopParams) {
		return this._core_transform.matrix(
			params.t,
			params.r,
			params.s,
			params.scale,
			ROTATION_ORDERS[params.rotationOrder]
		);
	}
}

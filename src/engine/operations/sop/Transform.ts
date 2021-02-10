import {BaseSopOperation} from './_Base';
import {CoreGroup, Object3DWithGeometry} from '../../../core/geometry/Group';
import {Vector3} from 'three/src/math/Vector3';
import {Matrix4} from 'three/src/math/Matrix4';
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

interface TransformSopParams extends DefaultOperationParams {
	applyOn: number;
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
		const matrix = this._core_transform.matrix(
			params.t,
			params.r,
			params.s,
			params.scale,
			ROTATION_ORDERS[params.rotationOrder]
		);

		this._apply_transform(objects, params, matrix);

		return input_contents[0];
	}
	private _apply_transform(objects: Object3D[], params: TransformSopParams, matrix: Matrix4) {
		const mode = TRANSFORM_TARGET_TYPES[params.applyOn];
		switch (mode) {
			case TransformTargetType.GEOMETRIES: {
				return this._apply_matrix_to_geometries(objects, params, matrix);
			}
			case TransformTargetType.OBJECTS: {
				return this._apply_matrix_to_objects(objects, matrix);
			}
		}
		TypeAssert.unreachable(mode);
	}

	private _point_pos = new Vector3();
	private _apply_matrix_to_geometries(objects: Object3D[], params: TransformSopParams, matrix: Matrix4) {
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
				const position = point.position(this._point_pos).sub(params.pivot);
				position.applyMatrix4(matrix);
				point.setPosition(position.add(params.pivot));
			}
		}
	}
	private _object_position = new Vector3();
	private _apply_matrix_to_objects(objects: Object3D[], matrix: Matrix4) {
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
}

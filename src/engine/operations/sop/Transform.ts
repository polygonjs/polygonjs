import {BaseSopOperation} from './_Base';
import {CoreGroup, Object3DWithGeometry} from '../../../core/geometry/Group';
import {TypeAssert} from '../../../engine/poly/Assert';

import {
	CoreTransform,
	ROTATION_ORDERS,
	RotationOrder,
	TransformTargetType,
	TRANSFORM_TARGET_TYPES,
} from '../../../core/Transform';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {MathUtils, Vector3, Object3D} from 'three';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {
	OBJECT_TRANSFORM_SPACES,
	ObjectTransformSpace,
	applyTransformWithSpaceToObject,
} from '../../../core/TransformSpace';

export enum TransformObjectMode {
	SET = 'set matrix',
	MULT = 'multiply matrix',
}
export const TRANSFORM_OBJECT_MODES: TransformObjectMode[] = [TransformObjectMode.SET, TransformObjectMode.MULT];

interface TransformSopParams extends DefaultOperationParams {
	applyOn: number;
	objectMode: number;
	objectTransformSpace: number;
	group: string;
	rotationOrder: number;
	t: Vector3;
	r: Vector3;
	s: Vector3;
	scale: number;
	pivot: Vector3;
}

export class TransformSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: TransformSopParams = {
		applyOn: TRANSFORM_TARGET_TYPES.indexOf(TransformTargetType.GEOMETRIES),
		objectMode: TRANSFORM_OBJECT_MODES.indexOf(TransformObjectMode.SET),
		objectTransformSpace: OBJECT_TRANSFORM_SPACES.indexOf(ObjectTransformSpace.PARENT),
		group: '',
		rotationOrder: ROTATION_ORDERS.indexOf(RotationOrder.XYZ),
		t: new Vector3(0, 0, 0),
		r: new Vector3(0, 0, 0),
		s: new Vector3(1, 1, 1),
		scale: 1,
		pivot: new Vector3(0, 0, 0),
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<'transform'> {
		return 'transform';
	}

	private _coreTransform = new CoreTransform();
	override cook(inputCoreGroups: CoreGroup[], params: TransformSopParams) {
		const coreGroup = inputCoreGroups[0];
		const objects = coreGroup.objects();

		this._applyTransform(objects, params);
		coreGroup.resetBoundingBox();
		return coreGroup;
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
				object.traverse((childObject) => {
					const geometry = (childObject as Object3DWithGeometry).geometry;
					if (geometry) {
						geometry.translate(-params.pivot.x, -params.pivot.y, -params.pivot.z);
						geometry.applyMatrix4(matrix);
						geometry.translate(params.pivot.x, params.pivot.y, params.pivot.z);
					}
				});
			}
		} else {
			const coreGroup = CoreGroup._fromObjects(objects);
			const points = coreGroup.pointsFromGroup(params.group);
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
			case TransformObjectMode.SET: {
				return this._setMatrix(objects, params);
			}
			case TransformObjectMode.MULT: {
				return this._multMatrix(objects, params);
			}
		}
		TypeAssert.unreachable(objectMode);
	}

	private _objectScale = new Vector3();
	private _r = new Vector3();
	private _setMatrix(objects: Object3D[], params: TransformSopParams) {
		for (let object of objects) {
			object.position.copy(params.t);
			const order = ROTATION_ORDERS[params.rotationOrder];
			this._r.copy(params.r).multiplyScalar(MathUtils.DEG2RAD);
			object.rotation.set(this._r.x, this._r.y, this._r.z, order);
			this._objectScale.copy(params.s).multiplyScalar(params.scale);
			object.scale.copy(this._objectScale);
			object.updateMatrix();
		}
	}

	// private _objectPosition = new Vector3();
	private _multMatrix(objects: Object3D[], params: TransformSopParams) {
		const matrix = this._matrix(params);
		const transformSpace = OBJECT_TRANSFORM_SPACES[params.objectTransformSpace];
		for (let object of objects) {
			applyTransformWithSpaceToObject(object, matrix, transformSpace);
			// // center to origin
			// // this._objectPosition.copy(object.position);
			// // object.position.set(0, 0, 0);
			// object.updateMatrix();
			// // apply matrix
			// // object.applyMatrix4(matrix);
			// object.matrix.multiply(matrix);
			// // revert to position
			// // object.position.add(this._objectPosition);
			// // object.updateMatrix();
			// object.matrix.decompose(object.position, object.quaternion, object.scale);
		}
	}

	private _matrix(params: TransformSopParams) {
		return this._coreTransform.matrix(
			params.t,
			params.r,
			params.s,
			params.scale,
			ROTATION_ORDERS[params.rotationOrder]
		);
	}
}

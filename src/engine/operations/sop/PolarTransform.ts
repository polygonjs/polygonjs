import {BaseSopOperation} from './_Base';
import {CoreGroup, Object3DWithGeometry} from '../../../core/geometry/Group';
import {Vector3, Matrix4, Object3D} from 'three';
import {TypeAssert} from '../../../engine/poly/Assert';
import {TransformTargetType, TRANSFORM_TARGET_TYPES} from '../../../core/Transform';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {CorePolarTransform, PolarTransformMatrixParams} from '../../../core/PolarTransform';

interface PolarTransformSopParams extends DefaultOperationParams, PolarTransformMatrixParams {
	applyOn: number;
}

export class PolarTransformSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: PolarTransformSopParams = {
		applyOn: TRANSFORM_TARGET_TYPES.indexOf(TransformTargetType.OBJECT),
		center: new Vector3(0, 0, 0),
		longitude: 0,
		latitude: 0,
		depth: 1,
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<'polarTransform'> {
		return 'polarTransform';
	}

	override cook(inputCoreGroups: CoreGroup[], params: PolarTransformSopParams) {
		const objects = inputCoreGroups[0].threejsObjects();
		CorePolarTransform.matrix(params, this._fullMatrix);

		this._applyTransform(objects, params, this._fullMatrix);

		return inputCoreGroups[0];
	}
	private _applyTransform(objects: Object3D[], params: PolarTransformSopParams, matrix: Matrix4) {
		const mode = TRANSFORM_TARGET_TYPES[params.applyOn];
		switch (mode) {
			case TransformTargetType.GEOMETRY: {
				return this._applyMatrixToGeometries(objects, matrix);
			}
			case TransformTargetType.OBJECT: {
				return this._applyMatrixToObjects(objects, matrix);
			}
		}
		TypeAssert.unreachable(mode);
	}

	private _applyMatrixToGeometries(objects: Object3D[], matrix: Matrix4) {
		for (let object of objects) {
			const geometry = (object as Object3DWithGeometry).geometry;
			if (geometry) {
				geometry.applyMatrix4(matrix);
			}
		}
	}
	private _applyMatrixToObjects(objects: Object3D[], matrix: Matrix4) {
		for (let object of objects) {
			CorePolarTransform.applyMatrixToObject(object, matrix);
		}
	}

	private _fullMatrix = new Matrix4();
}

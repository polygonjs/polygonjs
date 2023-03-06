import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {TypeAssert} from '../../poly/Assert';
import {Mesh, Object3D, Vector3} from 'three';
import {Matrix4} from 'three';
import {CoreTransform} from '../../../core/Transform';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {DefaultOperationParams} from '../../../core/operations/_Base';

export enum TransformResetMode {
	RESET_OBJECT = 'reset objects transform',
	CENTER_GEO = 'center geometries',
	CENTER_GEO_RESET_OBJECT = 'center geometry and reset object',
}
export const TRANSFORM_RESET_MODES: TransformResetMode[] = [
	TransformResetMode.RESET_OBJECT,
	TransformResetMode.CENTER_GEO,
	TransformResetMode.CENTER_GEO_RESET_OBJECT,
];

interface TransformResetSopParams extends DefaultOperationParams {
	mode: number;
}

export interface CenterCoreGroupOptions {
	applyMatrixToObject: boolean;
	refCoreGroup?: CoreGroup;
}
export interface CenterObjectOptions {
	applyMatrixToObject: boolean;
	refObject?: Object3D;
}

const bboxCenter = new Vector3();
const translateMatrix = new Matrix4();

export class TransformResetSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: TransformResetSopParams = {
		mode: 0,
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<'transformReset'> {
		return 'transformReset';
	}

	override cook(inputCoreGroups: CoreGroup[], params: TransformResetSopParams) {
		const mode = TRANSFORM_RESET_MODES[params.mode];
		return this._selectMode(mode, inputCoreGroups);
	}
	private _selectMode(mode: TransformResetMode, coreGroups: CoreGroup[]) {
		switch (mode) {
			case TransformResetMode.RESET_OBJECT: {
				return this._resetObjects(coreGroups[0]);
			}
			case TransformResetMode.CENTER_GEO: {
				return TransformResetSopOperation.centerCoreGroup(coreGroups[0], {
					applyMatrixToObject: false,
					refCoreGroup: coreGroups[1],
				});
			}
			case TransformResetMode.CENTER_GEO_RESET_OBJECT: {
				return TransformResetSopOperation.centerCoreGroup(coreGroups[0], {
					applyMatrixToObject: true,
					refCoreGroup: coreGroups[1],
				});
			}
		}
		TypeAssert.unreachable(mode);
	}

	private _resetObjects(coreGroup: CoreGroup) {
		const objects = coreGroup.threejsObjects();
		for (let object of objects) {
			object.matrix.identity();
			CoreTransform.decomposeMatrix(object);
		}

		return coreGroup;
	}
	static centerCoreGroup(coreGroup: CoreGroup, options: CenterCoreGroupOptions) {
		const objects = coreGroup.threejsObjects();
		let refObjects = objects;
		if (options.refCoreGroup) {
			refObjects = options.refCoreGroup.threejsObjectsWithGeo();
		}
		for (let i = 0; i < objects.length; i++) {
			const object = objects[i];
			const refObject = refObjects[i] || refObjects[refObjects.length - 1];
			TransformResetSopOperation.centerObject(object, {
				applyMatrixToObject: options.applyMatrixToObject,
				refObject,
			});
		}

		return coreGroup;
	}
	static centerObject(object: Object3D, options: CenterObjectOptions) {
		const refObject = options.refObject || object;
		const geometry = (object as Mesh).geometry;
		const refGeometry = (refObject as Mesh).geometry;
		if (geometry && refGeometry) {
			// TODO: this current does not take into account the object transform,
			// and it's possible that it has been, especially if we used another transform_reset
			// just before
			refGeometry.computeBoundingBox();
			const bbox = refGeometry.boundingBox;
			if (bbox) {
				bbox.getCenter(bboxCenter);
				refObject.updateMatrixWorld();
				bboxCenter.applyMatrix4(refObject.matrixWorld);

				if (options.applyMatrixToObject) {
					translateMatrix.identity();
					translateMatrix.makeTranslation(bboxCenter.x, bboxCenter.y, bboxCenter.z);
					object.matrix.multiply(translateMatrix);
					CoreTransform.decomposeMatrix(object);
					object.updateWorldMatrix(false, false);
					// object.updateMatrixWorld();
				}
				translateMatrix.identity();
				translateMatrix.makeTranslation(-bboxCenter.x, -bboxCenter.y, -bboxCenter.z);
				geometry.applyMatrix4(translateMatrix);
			}
		}
	}
}

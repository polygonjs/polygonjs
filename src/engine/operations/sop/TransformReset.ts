import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {TypeAssert} from '../../poly/Assert';
import {Vector3} from 'three/src/math/Vector3';
import {Matrix4} from 'three/src/math/Matrix4';

import {CoreTransform} from '../../../core/Transform';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {DefaultOperationParams} from '../../../core/operations/_Base';

export enum TransformResetMode {
	RESET_OBJECT = 'reset objects transform',
	CENTER_GEO = 'center geometries',
	PROMOTE_GEO_TO_OBJECT = 'center geometry and transform object',
}
export const TRANSFORM_RESET_MODES: TransformResetMode[] = [
	TransformResetMode.RESET_OBJECT,
	TransformResetMode.CENTER_GEO,
	TransformResetMode.PROMOTE_GEO_TO_OBJECT,
];

interface TransformResetSopParams extends DefaultOperationParams {
	mode: number;
}

export interface CenterGeosOptions {
	applyMatrixToObject: boolean;
	refCoreGroup?: CoreGroup;
}

export class TransformResetSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: TransformResetSopParams = {
		mode: 0,
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<'transformReset'> {
		return 'transformReset';
	}
	private _bboxCenter = new Vector3();
	private _translateMatrix = new Matrix4();
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
				return this._centerGeos(coreGroups[0], {applyMatrixToObject: false, refCoreGroup: coreGroups[1]});
			}
			case TransformResetMode.PROMOTE_GEO_TO_OBJECT: {
				return this._centerGeos(coreGroups[0], {applyMatrixToObject: true, refCoreGroup: coreGroups[1]});
			}
		}
		TypeAssert.unreachable(mode);
	}

	private _resetObjects(coreGroup: CoreGroup) {
		const objects = coreGroup.objects();
		for (let object of objects) {
			object.matrix.identity();
			CoreTransform.decomposeMatrix(object);
		}

		return coreGroup;
	}
	private _centerGeos(coreGroup: CoreGroup, options: CenterGeosOptions) {
		const objects = coreGroup.objectsWithGeo();
		let refObjects = objects;
		if (options.refCoreGroup) {
			refObjects = options.refCoreGroup.objectsWithGeo();
		}
		for (let i = 0; i < objects.length; i++) {
			const object = objects[i];
			const refObject = refObjects[i] || refObjects[refObjects.length - 1];
			const geometry = object.geometry;
			const refGeometry = refObject.geometry;
			if (geometry && refGeometry) {
				// TODO: this current does not take into account the object transform,
				// and it's possible that it has been, especially if we used another transform_reset
				// just before
				refGeometry.computeBoundingBox();
				const bbox = refGeometry.boundingBox;
				if (bbox) {
					bbox.getCenter(this._bboxCenter);
					refObject.updateMatrixWorld();
					this._bboxCenter.applyMatrix4(refObject.matrixWorld);

					if (options.applyMatrixToObject) {
						this._translateMatrix.identity();
						this._translateMatrix.makeTranslation(
							this._bboxCenter.x,
							this._bboxCenter.y,
							this._bboxCenter.z
						);
						object.matrix.multiply(this._translateMatrix);
						CoreTransform.decomposeMatrix(object);
						object.updateWorldMatrix(false, false);
						// object.updateMatrixWorld();
					}
					this._translateMatrix.identity();
					this._translateMatrix.makeTranslation(
						-this._bboxCenter.x,
						-this._bboxCenter.y,
						-this._bboxCenter.z
					);
					geometry.applyMatrix4(this._translateMatrix);
				}
			}
		}

		return coreGroup;
	}
}

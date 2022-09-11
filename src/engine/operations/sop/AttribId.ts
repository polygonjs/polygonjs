import {BaseSopOperation} from './_Base';
import {CoreGroup, Object3DWithGeometry} from '../../../core/geometry/Group';
import {Attribute} from '../../../core/geometry/Attribute';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {BufferAttribute} from 'three';
import {isBooleanTrue} from '../../../core/Type';
interface AttribIdSopParams extends DefaultOperationParams {
	id: boolean;
	idName: string;
	idn: boolean;
	idnName: string;
}

export class AttribIdSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: AttribIdSopParams = {
		id: true,
		idName: 'id',
		idn: true,
		idnName: 'idn',
	};
	static override type(): Readonly<'attribId'> {
		return 'attribId';
	}

	override cook(inputCoreGroups: CoreGroup[], params: AttribIdSopParams) {
		const coreGroup = inputCoreGroups[0];
		const objects = coreGroup.objectsWithGeo();

		for (let object of objects) {
			this._processObject(object, params);
		}

		return this.createCoreGroupFromObjects(objects);
	}

	private _processObject(object: Object3DWithGeometry, params: AttribIdSopParams) {
		const geometry = object.geometry;
		if (!geometry) {
			return;
		}
		const positionAttrib = geometry.getAttribute(Attribute.POSITION);
		if (!positionAttrib) {
			return;
		}
		const pointsCount = positionAttrib.count;

		if (isBooleanTrue(params.id)) {
			const idValues = new Array(pointsCount);
			for (let i = 0; i < pointsCount; i++) {
				idValues[i] = i;
			}
			const idArray = new Float32Array(idValues);
			geometry.setAttribute(params.idName, new BufferAttribute(idArray, 1));
		}
		if (isBooleanTrue(params.idn)) {
			const idnValues = new Array(pointsCount);
			const pointsCountMinus1 = pointsCount - 1;
			if (pointsCountMinus1 == 0) {
				for (let i = 0; i < pointsCount; i++) {
					idnValues[i] = 0;
				}
			} else {
				for (let i = 0; i < pointsCount; i++) {
					idnValues[i] = i / (pointsCount - 1);
				}
			}
			const idnArray = new Float32Array(idnValues);
			geometry.setAttribute(params.idnName, new BufferAttribute(idnArray, 1));
		}
	}
}

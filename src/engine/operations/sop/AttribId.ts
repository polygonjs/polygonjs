import {TypeAssert} from './../../poly/Assert';
import {AttribClass, ATTRIBUTE_CLASSES_WITHOUT_CORE_GROUP} from './../../../core/geometry/Constant';
import {BaseSopOperation} from './_Base';
import {CoreGroup, Object3DWithGeometry} from '../../../core/geometry/Group';
import {Attribute} from '../../../core/geometry/Attribute';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {BufferAttribute, Object3D} from 'three';
import {isBooleanTrue} from '../../../core/Type';
import {BaseCoreObject} from '../../../core/geometry/_BaseObject';
import {CoreObjectType} from '../../../core/geometry/ObjectContent';

interface AttribIdSopParams extends DefaultOperationParams {
	class: number;
	id: boolean;
	idName: string;
	idn: boolean;
	idnName: string;
}

export class AttribIdSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: AttribIdSopParams = {
		class: ATTRIBUTE_CLASSES_WITHOUT_CORE_GROUP.indexOf(AttribClass.POINT),
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

		const attribClass = ATTRIBUTE_CLASSES_WITHOUT_CORE_GROUP[params.class];
		this._addAttribute(attribClass, coreGroup, params);
		// for (let object of objects) {
		// 	this._addPointAttributes(object, params);
		// }
		return coreGroup;
		// return this.createCoreGroupFromObjects(objects);
	}
	private async _addAttribute(attribClass: AttribClass, coreGroup: CoreGroup, params: AttribIdSopParams) {
		switch (attribClass) {
			case AttribClass.POINT:
				return this._addPointAttributesToObjects(coreGroup.threejsObjects(), params);
			case AttribClass.VERTEX: {
				this.states?.error.set('primitive not supported yet');
				return;
			}
			case AttribClass.PRIMITIVE: {
				this.states?.error.set('primitive not supported yet');
				return;
			}

			case AttribClass.OBJECT:
				return this._addObjectAttributes(coreGroup.allCoreObjects(), params);
			case AttribClass.CORE_GROUP:
				// no effect
				return;
		}
		TypeAssert.unreachable(attribClass);
	}

	private _addObjectAttributes(coreObjects: BaseCoreObject<CoreObjectType>[], params: AttribIdSopParams) {
		let i = 0;
		let objectsCount = coreObjects.length;
		for (const coreObject of coreObjects) {
			if (isBooleanTrue(params.id)) {
				coreObject.addAttribute(params.idName, i);
			}
			if (isBooleanTrue(params.idn)) {
				coreObject.addAttribute(params.idnName, i / (objectsCount - 1));
			}

			i++;
		}
	}

	private _addPointAttributesToObjects(objects: Object3D[], params: AttribIdSopParams) {
		for (let object of objects) {
			this._addPointAttributesToObject(object, params);
		}
	}

	private _addPointAttributesToObject(object: Object3D, params: AttribIdSopParams) {
		const geometry = (object as Object3DWithGeometry).geometry;
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

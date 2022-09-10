import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {Vector2} from 'three';
import {Vector3} from 'three';
import {Vector4} from 'three';
import {ATTRIBUTE_CLASSES, AttribClass, AttribType, ATTRIBUTE_TYPES} from '../../../core/geometry/Constant';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {TypeAssert} from '../../../engine/poly/Assert';
import {CoreObject} from '../../../core/geometry/Object';
import {CoreAttribute} from '../../../core/geometry/Attribute';
import {DefaultOperationParams} from '../../../core/operations/_Base';

interface AttribCreateSopParams extends DefaultOperationParams {
	group: string;
	class: number;
	type: number;
	name: string;
	size: number;
	value1: number;
	value2: Vector2;
	value3: Vector3;
	value4: Vector4;
	string: string;
}

export class AttribCreateSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: AttribCreateSopParams = {
		group: '',
		class: ATTRIBUTE_CLASSES.indexOf(AttribClass.VERTEX),
		type: ATTRIBUTE_TYPES.indexOf(AttribType.NUMERIC),
		name: 'newAttrib',
		size: 1,
		value1: 0,
		value2: new Vector2(0, 0),
		value3: new Vector3(0, 0, 0),
		value4: new Vector4(0, 0, 0, 0),
		string: '',
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<'attribCreate'> {
		return 'attribCreate';
	}

	override cook(inputCoreGroups: CoreGroup[], params: AttribCreateSopParams) {
		const coreGroup = inputCoreGroups[0];
		const attribName = params.name;
		if (attribName && attribName.trim() != '') {
			this._addAttribute(ATTRIBUTE_CLASSES[params.class], coreGroup, params);
		} else {
			this.states?.error.set('attribute name is not valid');
		}
		return coreGroup;
	}
	private _addAttribute(attribClass: AttribClass, coreGroup: CoreGroup, params: AttribCreateSopParams) {
		const attrib_type = ATTRIBUTE_TYPES[params.type];
		switch (attribClass) {
			case AttribClass.VERTEX:
				this._addPointAttribute(attrib_type, coreGroup, params);
				return;
			case AttribClass.OBJECT:
				this._addObjectAttribute(attrib_type, coreGroup, params);
				return;
			case AttribClass.CORE_GROUP:
				this._addCoreGroupAttribute(attrib_type, coreGroup, params);
				return;
		}
		TypeAssert.unreachable(attribClass);
	}

	private _addPointAttribute(attribType: AttribType, coreGroup: CoreGroup, params: AttribCreateSopParams) {
		const coreObjects = coreGroup.coreObjects();
		switch (attribType) {
			case AttribType.NUMERIC: {
				for (let coreObject of coreObjects) {
					this._addNumericAttributeToPoints(coreObject, params);
				}
				return;
			}
			case AttribType.STRING: {
				for (let coreObject of coreObjects) {
					this._addStringAttributeToPoints(coreObject, params);
				}
				return;
			}
		}
		TypeAssert.unreachable(attribType);
	}
	private _addObjectAttribute(attribType: AttribType, coreGroup: CoreGroup, params: AttribCreateSopParams) {
		const coreObjects = coreGroup.coreObjectsFromGroup(params.group);

		// add attrib if non existent
		const attribName = params.name;
		const allCoreObjects = coreGroup.coreObjects();
		const defaultValue = AttribCreateSopOperation.defaultAttribValue(params);
		if (defaultValue != null) {
			for (let coreObject of allCoreObjects) {
				if (!coreObject.hasAttrib(attribName)) {
					coreObject.setAttribValue(attribName, defaultValue);
				}
			}
		}

		switch (attribType) {
			case AttribType.NUMERIC:
				this._addNumericAttributeToObjects(coreObjects, params);
				return;
			case AttribType.STRING:
				this._addStringAttributeToObjects(coreObjects, params);
				return;
		}
		TypeAssert.unreachable(attribType);
	}
	private _addCoreGroupAttribute(attribType: AttribType, coreGroup: CoreGroup, params: AttribCreateSopParams) {
		switch (attribType) {
			case AttribType.NUMERIC:
				this._addNumericAttributeToCoreGroup(coreGroup, params);
				return;
			case AttribType.STRING:
				this._addStringAttributeToCoreGroup(coreGroup, params);
				return;
		}
		TypeAssert.unreachable(attribType);
	}

	private _addNumericAttributeToPoints(coreObject: CoreObject, params: AttribCreateSopParams) {
		const coreGeometry = coreObject.coreGeometry();
		if (!coreGeometry) {
			return;
		}
		const value = [params.value1, params.value2, params.value3, params.value4][params.size - 1];

		const attribName = CoreAttribute.remapName(params.name);
		if (!coreGeometry.hasAttrib(attribName)) {
			coreGeometry.addNumericAttrib(attribName, params.size, 0);
		} else {
			coreGeometry.markAttribAsNeedsUpdate(attribName);
		}

		if (params.group) {
			const points = coreObject.pointsFromGroup(params.group);
			for (let point of points) {
				point.setAttribValue(attribName, value);
			}
		} else {
			coreObject.addNumericVertexAttrib(attribName, params.size, value);
		}
	}

	private _addNumericAttributeToObjects(coreObjects: CoreObject[], params: AttribCreateSopParams) {
		const value = [params.value1, params.value2, params.value3, params.value4][params.size - 1];
		const attribName = params.name;
		for (let coreObject of coreObjects) {
			coreObject.setAttribValue(attribName, value);
		}
	}
	private _addNumericAttributeToCoreGroup(coreGroup: CoreGroup, params: AttribCreateSopParams) {
		const value = [params.value1, params.value2, params.value3, params.value4][params.size - 1];
		const attribName = params.name;
		coreGroup.setAttribValue(attribName, value);
	}

	private _addStringAttributeToPoints(coreObject: CoreObject, params: AttribCreateSopParams) {
		const coreGeometry = coreObject.coreGeometry();
		if (!coreGeometry) {
			return;
		}
		const points = coreObject.pointsFromGroup(params.group);
		const attribName = params.name;
		const value = params.string;

		let stringValues: string[] = new Array(points.length);

		// if a group is given, we prefill the existing stringValues
		if (this._hasGroup(params)) {
			const allPoints = coreObject.points();
			stringValues = stringValues.length != allPoints.length ? new Array(allPoints.length) : stringValues;
			// create attrib if non existent
			if (!coreGeometry.hasAttrib(attribName)) {
				const tmpIndexData = CoreAttribute.arrayToIndexedArrays(['']);
				coreGeometry.setIndexedAttribute(attribName, tmpIndexData['values'], tmpIndexData['indices']);
			}

			for (let point of allPoints) {
				let currentValue = point.stringAttribValue(attribName);
				if (currentValue == null) {
					currentValue = '';
				}
				stringValues[point.index()] = currentValue;
			}
		}

		for (let point of points) {
			stringValues[point.index()] = value;
		}

		const indexData = CoreAttribute.arrayToIndexedArrays(stringValues);

		coreGeometry.setIndexedAttribute(attribName, indexData['values'], indexData['indices']);
	}

	private _addStringAttributeToObjects(coreObjects: CoreObject[], params: AttribCreateSopParams) {
		const value = params.string;
		for (let coreObject of coreObjects) {
			coreObject.setAttribValue(params.name, value);
		}
	}
	private _addStringAttributeToCoreGroup(coreGroup: CoreGroup, params: AttribCreateSopParams) {
		const value = params.string;
		coreGroup.setAttribValue(params.name, value);
	}
	private _hasGroup(params: AttribCreateSopParams) {
		return params.group.trim() != '';
	}

	//
	//
	// INTERNAL UTILS
	//
	//
	private static _attribType(params: AttribCreateSopParams) {
		return ATTRIBUTE_TYPES[params.type];
	}

	static defaultAttribValue(params: AttribCreateSopParams) {
		const attribType = this._attribType(params);
		switch (attribType) {
			case AttribType.NUMERIC: {
				return this._defaultNumericValue(params);
			}
			case AttribType.STRING: {
				return this._defaultStringValue();
			}
		}
		TypeAssert.unreachable(attribType);
	}
	private static _defaultStringValue() {
		return '';
	}
	private static _defaultNumericValue(params: AttribCreateSopParams) {
		const size = params.size;
		switch (size) {
			case 1:
				return 0;
			case 2:
				return new Vector2(0, 0);
			case 3:
				return new Vector3(0, 0, 0);
			case 4:
				return new Vector4(0, 0, 0, 0);
		}
	}
}

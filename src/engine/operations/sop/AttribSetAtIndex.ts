import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {BufferAttribute, Vector2, Vector3, Vector4} from 'three';
import {ATTRIBUTE_CLASSES, AttribClass, AttribType, ATTRIBUTE_TYPES} from '../../../core/geometry/Constant';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {TypeAssert} from '../../../engine/poly/Assert';
import {BaseCoreObject} from '../../../core/geometry/entities/object/BaseCoreObject';
import {CoreAttribute} from '../../../core/geometry/Attribute';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {CoreObjectType, ObjectContent} from '../../../core/geometry/ObjectContent';
import {corePointClassFactory} from '../../../core/geometry/CoreObjectFactory';
import {pointsFromObject} from '../../../core/geometry/entities/point/CorePointUtils';
import { CorePoint } from '../../../core/geometry/entities/point/CorePoint';

interface AttribSetAtIndexSopParams extends DefaultOperationParams {
	index: number;
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
const _points:CorePoint<CoreObjectType>[]=[]

export class AttribSetAtIndexSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: AttribSetAtIndexSopParams = {
		index: 0,
		class: ATTRIBUTE_CLASSES.indexOf(AttribClass.POINT),
		type: ATTRIBUTE_TYPES.indexOf(AttribType.NUMERIC),
		name: 'new_attrib',
		size: 1,
		value1: 0,
		value2: new Vector2(0, 0),
		value3: new Vector3(0, 0, 0),
		value4: new Vector4(0, 0, 0, 0),
		string: '',
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<'attribSetAtIndex'> {
		return 'attribSetAtIndex';
	}

	override cook(inputCoreGroups: CoreGroup[], params: AttribSetAtIndexSopParams) {
		const coreGroup = inputCoreGroups[0];
		const attribName = params.name;
		if (attribName && attribName.trim() != '') {
			this._addAttribute(ATTRIBUTE_CLASSES[params.class], coreGroup, params);
		} else {
			this.states?.error.set('attribute name is not valid');
		}
		return coreGroup;
	}
	private _addAttribute(attribClass: AttribClass, coreGroup: CoreGroup, params: AttribSetAtIndexSopParams) {
		const attribType = ATTRIBUTE_TYPES[params.type];
		switch (attribClass) {
			case AttribClass.POINT:
				this._addPointAttribute(attribType, coreGroup, params);
				return;
			case AttribClass.VERTEX:
				this.states?.error.set('vertex not supported yet');
				return;
			case AttribClass.PRIMITIVE:
				this.states?.error.set('primitive not supported yet');
				return;
			case AttribClass.OBJECT:
				this._addObjectAttribute(attribType, coreGroup, params);
				return;
			case AttribClass.CORE_GROUP:
				this._addCoreGroupAttribute(attribType, coreGroup, params);
				return;
		}
		TypeAssert.unreachable(attribClass);
	}

	private _addPointAttribute(attribType: AttribType, coreGroup: CoreGroup, params: AttribSetAtIndexSopParams) {
		const objects = coreGroup.allObjects();
		switch (attribType) {
			case AttribType.NUMERIC: {
				for (let object of objects) {
					this._addNumericAttributeToPoints(object, params);
				}
				return;
			}
			case AttribType.STRING: {
				for (let object of objects) {
					this._addStringAttributeToPoints(object, params);
				}
				return;
			}
		}
		TypeAssert.unreachable(attribType);
	}
	private _addObjectAttribute(attribType: AttribType, coreGroup: CoreGroup, params: AttribSetAtIndexSopParams) {
		const allCoreObjects = coreGroup.allCoreObjects();

		// add attrib if non existent
		const attribName = params.name;
		const defaultValue = AttribSetAtIndexSopOperation.defaultAttribValue(params);
		if (defaultValue != null) {
			for (let coreObject of allCoreObjects) {
				if (!coreObject.hasAttribute(attribName)) {
					coreObject.setAttribValue(attribName, defaultValue);
				}
			}
		}
		const coreObject = allCoreObjects[params.index];
		if (!coreObject) {
			return;
		}
		switch (attribType) {
			case AttribType.NUMERIC:
				this._addNumericAttributeToObject(coreObject, params);
				return;
			case AttribType.STRING:
				this._addStringAttributeToObject(coreObject, params);
				return;
		}
		TypeAssert.unreachable(attribType);
	}
	private _addCoreGroupAttribute(attribType: AttribType, coreGroup: CoreGroup, params: AttribSetAtIndexSopParams) {
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

	private _addNumericAttributeToPoints<T extends CoreObjectType>(
		object: ObjectContent<T>,
		params: AttribSetAtIndexSopParams
	) {
		const corePointClass = corePointClassFactory(object);
		const attribName = CoreAttribute.remapName(params.name);
		if (!corePointClass.hasAttribute(object, attribName)) {
			corePointClass.addNumericAttribute(object, attribName, params.size, 0);
		}

		const attrib = corePointClass.attribute(object, attribName) as BufferAttribute;
		const array = attrib.array as number[];
		const {index, size} = params;
		switch (size) {
			case 1: {
				if (index < array.length) {
					array[index] = params.value1;
					attrib.needsUpdate = true;
				}
				break;
			}
			case 2: {
				const i2 = index * 2;
				if (i2 < array.length) {
					params.value2.toArray(array, i2);
					attrib.needsUpdate = true;
				}
				break;
			}
			case 3: {
				const i3 = index * 3;
				if (i3 < array.length) {
					params.value3.toArray(array, i3);
					attrib.needsUpdate = true;
				}
				break;
			}
			case 4: {
				const i4 = index * 4;
				if (i4 < array.length) {
					params.value4.toArray(array, i4);
					attrib.needsUpdate = true;
				}
				break;
			}
		}
	}

	private _addNumericAttributeToObject(
		coreObject: BaseCoreObject<CoreObjectType>,
		params: AttribSetAtIndexSopParams
	) {
		const value = [params.value1, params.value2, params.value3, params.value4][params.size - 1];
		const attribName = params.name;
		coreObject.setAttribValue(attribName, value);
	}
	private _addNumericAttributeToCoreGroup(coreGroup: CoreGroup, params: AttribSetAtIndexSopParams) {
		const value = [params.value1, params.value2, params.value3, params.value4][params.size - 1];
		const attribName = params.name;
		coreGroup.setAttribValue(attribName, value);
	}

	private _addStringAttributeToPoints<T extends CoreObjectType>(
		object: ObjectContent<T>,
		params: AttribSetAtIndexSopParams
	) {
		const corePointClass = corePointClassFactory(object);

		const attribName = params.name;
		// create attrib if non existent
		if (!corePointClass.hasAttribute(object, attribName)) {
			const tmpIndexData = CoreAttribute.arrayToIndexedArrays(['']);
			corePointClass.setIndexedAttribute(object, attribName, tmpIndexData['values'], tmpIndexData['indices']);
		}

		const value = params.string;

		pointsFromObject(object,_points);
		const indexPoint = _points[params.index];
		let stringValues: string[] = new Array(_points.length);

		// We prefill the existing stringValues
		// const allPoints = coreObject.points();
		stringValues = stringValues.length != _points.length ? new Array(_points.length) : stringValues;

		for (const point of _points) {
			let currentValue = point.stringAttribValue(attribName);
			if (currentValue == null) {
				currentValue = '';
			}
			stringValues[point.index()] = currentValue;
		}

		if (indexPoint) {
			stringValues[indexPoint.index()] = value;
		}

		const indexData = CoreAttribute.arrayToIndexedArrays(stringValues);

		corePointClass.setIndexedAttribute(object, attribName, indexData['values'], indexData['indices']);
	}

	private _addStringAttributeToObject(coreObject: BaseCoreObject<CoreObjectType>, params: AttribSetAtIndexSopParams) {
		const value = params.string;
		coreObject.setAttribValue(params.name, value);
	}
	private _addStringAttributeToCoreGroup(coreGroup: CoreGroup, params: AttribSetAtIndexSopParams) {
		const value = params.string;
		coreGroup.setAttribValue(params.name, value);
	}

	//
	//
	// INTERNAL UTILS
	//
	//
	private static _attribType(params: AttribSetAtIndexSopParams) {
		return ATTRIBUTE_TYPES[params.type];
	}

	static defaultAttribValue(params: AttribSetAtIndexSopParams) {
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
	private static _defaultNumericValue(params: AttribSetAtIndexSopParams) {
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

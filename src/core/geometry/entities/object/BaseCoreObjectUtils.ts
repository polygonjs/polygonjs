import {AttribValue, PolyDictionary} from '../../../../types/GlobalTypes';
import {CoreObjectType, ObjectContent, isObject3D} from '../../ObjectContent';
import {AttribSize, AttribType, ObjectData, ObjectType, objectTypeFromConstructor} from '../../Constant';
import {EntityGroupCollection} from '../../EntityGroupCollection';
import type {BaseCoreObject} from '../../entities/object/BaseCoreObject';
import {addToSetAtEntry} from '../../../MapUtils';
import {setToArray} from '../../../SetUtils';

export type AttributeDictionary = PolyDictionary<AttribValue>;

export function objectData<T extends CoreObjectType>(object: ObjectContent<T>): ObjectData {
	const childrenCount = isObject3D(object) ? object.children.length : 0;
	const objectType = isObject3D(object) ? objectTypeFromConstructor(object.constructor) : (object.type as ObjectType);
	const groupData = EntityGroupCollection.data(object);
	return {
		type: objectType,
		name: object.name,
		childrenCount,
		groupData,
		verticesCount: 0,
		pointsCount: 0,
		primitivesCount: 0,
		primitiveName: 'no name',
	};
}

export function coreObjectsAttribSizesByName<T extends CoreObjectType>(
	coreObjects: BaseCoreObject<T>[]
): PolyDictionary<AttribSize[]> {
	const _sizesByName: Map<string, Set<AttribSize>> = new Map();
	for (const coreObject of coreObjects) {
		const objectAttriNames = coreObject.attribNames();
		for (const attribName of objectAttriNames) {
			const attribSize = coreObject.attribSize(attribName);
			addToSetAtEntry(_sizesByName, attribName, attribSize);
		}
	}

	const sizesByName: PolyDictionary<AttribSize[]> = {};
	_sizesByName.forEach((attribSizes, attribName) => {
		sizesByName[attribName] = setToArray(attribSizes, []);
	});
	return sizesByName;
}
export function coreObjectAttributeTypesByName<T extends CoreObjectType>(
	coreObjects: BaseCoreObject<T>[]
): PolyDictionary<AttribType[]> {
	const _typesByName: Map<string, Set<AttribType>> = new Map();
	for (const coreObject of coreObjects) {
		const objectAttriNames = coreObject.attribNames();
		for (const attribName of objectAttriNames) {
			const attribType = coreObject.attribType(attribName);
			addToSetAtEntry(_typesByName, attribName, attribType);
		}
	}

	const typesByName: PolyDictionary<AttribType[]> = {};
	_typesByName.forEach((attribTypes, attribName) => {
		typesByName[attribName] = setToArray(attribTypes, []);
	});
	return typesByName;
	// const core_object = this.firstCoreObject();
	// if (core_object) {
	// 	for (let name of core_object.attribNames()) {
	// 		types_by_name[name] = core_object.attribType(name);
	// 	}
	// }
	// return types_by_name;
}
export function coreObjectsAttribNames<T extends CoreObjectType>(coreObjects: BaseCoreObject<T>[]) {
	const names: Set<string> = new Set();
	for (const coreObject of coreObjects) {
		const objectAttriNames = coreObject.attribNames();
		for (const attribName of objectAttriNames) {
			names.add(attribName);
		}
	}

	return setToArray(names, []);
}

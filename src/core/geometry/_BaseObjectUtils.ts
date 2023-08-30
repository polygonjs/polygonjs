import {AttribValue, PolyDictionary} from '../../types/GlobalTypes';
import {Color, Vector2, Vector3, Vector4} from 'three';
import {CoreObjectType, ObjectContent, isObject3D} from './ObjectContent';
import {AttribSize, AttribType, ObjectData, ObjectType, objectTypeFromConstructor} from './Constant';
import {EntityGroupCollection} from './EntityGroupCollection';
import type {BaseCoreObject} from './_BaseObject';
import {addToSetAtEntry} from '../MapUtils';
import {setToArray} from '../SetUtils';

export type AttributeDictionary = PolyDictionary<AttribValue>;
export function attribValueNonPrimitive(src: AttribValue) {
	return src instanceof Color || src instanceof Vector2 || src instanceof Vector3 || src instanceof Vector4;
}
export function copyAttribValue(src: AttribValue, target: AttribValue) {
	if (target instanceof Color && src instanceof Color) {
		target.copy(src);
	}
	if (target instanceof Vector2 && src instanceof Vector2) {
		target.copy(src);
	}
	if (target instanceof Vector3 && src instanceof Vector3) {
		target.copy(src);
	}
	if (target instanceof Vector4 && src instanceof Vector4) {
		target.copy(src);
	}
}

export function cloneAttribValue(src: AttribValue) {
	if (src instanceof Color) {
		return src.clone();
	}
	if (src instanceof Vector2) {
		return src.clone();
	}
	if (src instanceof Vector3) {
		return src.clone();
	}
	if (src instanceof Vector4) {
		return src.clone();
	}
}

export function objectData<T extends CoreObjectType>(object: ObjectContent<T>): ObjectData {
	const childrenCount = isObject3D(object) ? object.children.length : 0;
	// if ((object as Mesh).geometry) {
	// 	points_count = CoreGeometry.pointsCount((object as Mesh).geometry as BufferGeometry);
	// }
	const objectType = isObject3D(object) ? objectTypeFromConstructor(object.constructor) : (object.type as ObjectType);
	const groupData = EntityGroupCollection.data(object);
	return {
		type: objectType,
		name: object.name,
		childrenCount,
		groupData,
		pointsCount: 0,
		tetsCount: null,
	};
}

export function coreObjectsAttribSizesByName<T extends CoreObjectType>(
	coreObjects: BaseCoreObject<T>[]
): PolyDictionary<AttribSize[]> {
	const _sizesByName: Map<string, Set<AttribSize>> = new Map();
	for (let coreObject of coreObjects) {
		const objectAttriNames = coreObject.attribNames();
		for (let attribName of objectAttriNames) {
			const attribSize = coreObject.attribSize(attribName);
			addToSetAtEntry(_sizesByName, attribName, attribSize);
		}
	}

	const sizesByName: PolyDictionary<AttribSize[]> = {};
	_sizesByName.forEach((attribSizes, attribName) => {
		sizesByName[attribName] = setToArray(attribSizes);
	});
	return sizesByName;
}
export function coreObjectAttributeTypesByName<T extends CoreObjectType>(
	coreObjects: BaseCoreObject<T>[]
): PolyDictionary<AttribType[]> {
	const _typesByName: Map<string, Set<AttribType>> = new Map();
	for (let coreObject of coreObjects) {
		const objectAttriNames = coreObject.attribNames();
		for (let attribName of objectAttriNames) {
			const attribType = coreObject.attribType(attribName);
			addToSetAtEntry(_typesByName, attribName, attribType);
		}
	}

	const typesByName: PolyDictionary<AttribType[]> = {};
	_typesByName.forEach((attribTypes, attribName) => {
		typesByName[attribName] = setToArray(attribTypes);
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
	for (let coreObject of coreObjects) {
		const objectAttriNames = coreObject.attribNames();
		for (let attribName of objectAttriNames) {
			names.add(attribName);
		}
	}

	return setToArray(names);
}

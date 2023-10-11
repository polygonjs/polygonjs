import {PolyDictionary} from '../../../../types/GlobalTypes';
import {arrayCompact} from '../../../ArrayUtils';
import {CoreString} from '../../../String';
import {AttribSize, AttribType, GroupString} from '../../Constant';
import {corePointClassFactory, corePointInstanceFactory} from '../../CoreObjectFactory';
import {CoreGroup} from '../../Group';
import {CoreObjectType, ObjectContent} from '../../ObjectContent';
import type {CorePoint} from './CorePoint';

const _indices: number[] = [];

export function points(coreGroup: CoreGroup) {
	return coreGroup
		.allCoreObjects()
		.map((o) => pointsFromObject(o.object()))
		.flat();
}
export function pointsAttribNamesFromCoreGroup(coreGroup: CoreGroup): string[] {
	const firstObject = coreGroup.allObjects()[0];
	if (firstObject) {
		return pointAttributeNames(firstObject);
	} else {
		return [];
	}
}
export function pointAttribSizesFromCoreGroup(coreGroup: CoreGroup): PolyDictionary<AttribSize> {
	const firstObject = coreGroup.allObjects()[0];
	if (firstObject) {
		return pointAttributeSizes(firstObject);
	} else {
		return {};
	}
}
export function pointAttribTypesFromCoreGroup(coreGroup: CoreGroup): PolyDictionary<AttribType> {
	const firstObject = coreGroup.allObjects()[0];
	if (firstObject) {
		return pointAttributeTypes(firstObject);
	} else {
		return {};
	}
}

export function pointsCountFromObject<T extends CoreObjectType>(object: ObjectContent<T>): number {
	const pointClass = corePointClassFactory(object);
	return pointClass.entitiesCount(object);
}
export function pointsFromObject<T extends CoreObjectType>(object: ObjectContent<T>): CorePoint<T>[] {
	const pointClass = corePointClassFactory(object);
	const pointsCount = pointClass.entitiesCount(object);
	const points: CorePoint<T>[] = new Array(pointsCount);
	for (let i = 0; i < pointsCount; i++) {
		points[i] = corePointInstanceFactory(object, i);
	}
	return points;
}

export function pointsFromObjectFromGroup<T extends CoreObjectType>(
	object: ObjectContent<T>,
	group: GroupString
): CorePoint<T>[] {
	if (group) {
		CoreString.indices(group, _indices);
		const points = pointsFromObject(object);
		const compactPoints: CorePoint<T>[] = [];
		return arrayCompact(
			_indices.map((i) => points[i]),
			compactPoints
		);
	} else {
		return pointsFromObject(object);
	}
}

export function hasPointAttribute<T extends CoreObjectType>(object: ObjectContent<T>, attribName: string): boolean {
	const pointClass = corePointClassFactory(object);
	const attributes = pointClass.attributes(object);
	if (!attributes) {
		return false;
	}
	return attribName in attributes;
}
export function pointAttributeNames<T extends CoreObjectType>(object: ObjectContent<T>): string[] {
	const pointClass = corePointClassFactory(object);
	const attributes = pointClass.attributes(object);
	if (!attributes) {
		return [];
	}
	return Object.keys(attributes);
}
export function pointAttributeSize<T extends CoreObjectType>(object: ObjectContent<T>, attribName: string): number {
	const pointClass = corePointClassFactory(object);
	const attributes = pointClass.attributes(object);
	if (!attributes) {
		return 0;
	}
	return attributes[attribName].itemSize;
}
export function pointAttributeSizes<T extends CoreObjectType>(object: ObjectContent<T>): PolyDictionary<AttribSize> {
	const pointClass = corePointClassFactory(object);
	const attributes = pointClass.attributes(object);
	if (!attributes) {
		return {};
	}
	const attribNames = Object.keys(attributes);
	const h: PolyDictionary<AttribSize> = {};
	for (const attribName of attribNames) {
		h[attribName] = attributes[attribName].itemSize;
	}
	return h;
}
export function pointAttributeType<T extends CoreObjectType>(object: ObjectContent<T>, attribName: string): AttribType {
	const pointClass = corePointClassFactory(object);
	const attributes = pointClass.attributes(object);
	if (!attributes) {
		return AttribType.NUMERIC;
	}
	return pointClass.attribType(object, attribName);
}
export function pointAttributeTypes<T extends CoreObjectType>(object: ObjectContent<T>): PolyDictionary<AttribType> {
	const pointClass = corePointClassFactory(object);
	const attributes = pointClass.attributes(object);
	if (!attributes) {
		return {};
	}
	const attribNames = Object.keys(attributes);
	const h: PolyDictionary<AttribType> = {};
	for (const attribName of attribNames) {
		h[attribName] = pointClass.attribType(object, attribName);
	}
	return h;
}

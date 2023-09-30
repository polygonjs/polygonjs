import {PolyDictionary} from '../../../../types/GlobalTypes';
import {arrayPushItems} from '../../../ArrayUtils';
import {stringToIndices} from '../../../String';
import {AttribSize, AttribType, GroupString} from '../../Constant';
import {corePrimitiveClassFactory, corePrimitiveInstanceFactory} from '../../CoreObjectFactory';
import {CoreGroup} from '../../Group';
import {CoreObjectType, ObjectContent} from '../../ObjectContent';
import {CorePrimitive} from './CorePrimitive';

const _indices: number[] = [];
const _tmpPrimitives: CorePrimitive<CoreObjectType>[] = [];

export function primitives<T extends CoreObjectType>(coreGroup: CoreGroup, target: CorePrimitive<T>[]) {
	const allObjects = coreGroup.allObjects();

	target.length = 0;
	for (const object of allObjects) {
		primitivesFromObject(object, _tmpPrimitives);
		arrayPushItems(_tmpPrimitives, target);
	}
	return target;
	// return coreGroup
	// 	.allCoreObjects()
	// 	.map((o) => primitivesFromObject(o.object()))
	// 	.flat();
}
export function primitiveAttribNamesFromCoreGroup(coreGroup: CoreGroup): string[] {
	const firstObject = coreGroup.allObjects()[0];
	if (firstObject) {
		return primitiveAttributeNames(firstObject);
	} else {
		return [];
	}
}
export function primitiveAttribSizesFromCoreGroup(coreGroup: CoreGroup): PolyDictionary<AttribSize> {
	const firstObject = coreGroup.allObjects()[0];
	if (firstObject) {
		return primitiveAttributeSizes(firstObject);
	} else {
		return {};
	}
}
export function primitiveAttribTypesFromCoreGroup(coreGroup: CoreGroup): PolyDictionary<AttribType> {
	const firstObject = coreGroup.allObjects()[0];
	if (firstObject) {
		return primitiveAttributeTypes(firstObject);
	} else {
		return {};
	}
}
export function primitivesCountFromObject<T extends CoreObjectType>(object: ObjectContent<T>): number {
	const primitiveClass = corePrimitiveClassFactory(object);
	return primitiveClass.primitivesCount(object);
}
export function primitivesFromObject<T extends CoreObjectType>(
	object: ObjectContent<T>,
	target: CorePrimitive<T>[]
): CorePrimitive<T>[] {
	const primitiveClass = corePrimitiveClassFactory(object);
	const primitivesCount = primitiveClass.primitivesCount(object);
	target.length = primitivesCount;
	for (let i = 0; i < primitivesCount; i++) {
		target[i] = corePrimitiveInstanceFactory(object, i);
	}
	return target;
}
export function primitivesFromObjectFromGroup<T extends CoreObjectType>(
	object: ObjectContent<T>,
	group: GroupString,
	target: CorePrimitive<T>[]
): CorePrimitive<T>[] {
	if (group) {
		stringToIndices(group, _indices);
		primitivesFromObject(object, _tmpPrimitives);
		for (const index of _indices) {
			const primitive = _tmpPrimitives[index] as CorePrimitive<T> | undefined;
			if (primitive) {
				target.push(primitive);
			}
		}
		return target;
	} else {
		return primitivesFromObject(object, target);
	}
}
export function primitiveAttributeNames<T extends CoreObjectType>(object: ObjectContent<T>): string[] {
	const primitiveClass = corePrimitiveClassFactory(object);
	const attributes = primitiveClass.attributes(object);
	if (!attributes) {
		return [];
	}
	return Object.keys(attributes);
}
export function primitiveAttributeSizes<T extends CoreObjectType>(
	object: ObjectContent<T>
): PolyDictionary<AttribSize> {
	const primitiveClass = corePrimitiveClassFactory(object);
	const attributes = primitiveClass.attributes(object);
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
export function primitiveAttributeTypes<T extends CoreObjectType>(
	object: ObjectContent<T>
): PolyDictionary<AttribType> {
	const primitiveClass = corePrimitiveClassFactory(object);
	const attributes = primitiveClass.attributes(object);
	if (!attributes) {
		return {};
	}
	const attribNames = Object.keys(attributes);
	const h: PolyDictionary<AttribType> = {};
	for (const attribName of attribNames) {
		h[attribName] = attributes[attribName].isString == true ? AttribType.STRING : AttribType.NUMERIC;
	}
	return h;
}

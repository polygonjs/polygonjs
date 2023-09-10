import {PolyDictionary} from '../../../../types/GlobalTypes';
import {ArrayUtils} from '../../../ArrayUtils';
import {CoreString} from '../../../String';
import {AttribSize, AttribType, GroupString} from '../../Constant';
import {corePrimitiveClassFactory, corePrimitiveInstanceFactory} from '../../CoreObjectFactory';
import {CoreGroup} from '../../Group';
import {CoreObjectType, ObjectContent} from '../../ObjectContent';
import {CorePrimitive} from './CorePrimitive';

export function primitives(coreGroup: CoreGroup) {
	return coreGroup
		.allCoreObjects()
		.map((o) => primitivesFromObject(o.object()))
		.flat();
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

export function primitivesFromObject<T extends CoreObjectType>(object: ObjectContent<T>): CorePrimitive<T>[] {
	const primitiveClass = corePrimitiveClassFactory(object);
	const primitivesCount = primitiveClass.primitivesCount(object);
	const primitives: CorePrimitive<T>[] = new Array(primitivesCount);
	for (let i = 0; i < primitivesCount; i++) {
		primitives[i] = corePrimitiveInstanceFactory(object, i);
	}
	return primitives;
}
export function primitivesFromObjectFromGroup<T extends CoreObjectType>(
	object: ObjectContent<T>,
	group: GroupString
): CorePrimitive<T>[] {
	if (group) {
		const indices = CoreString.indices(group);
		if (indices) {
			const primitives = primitivesFromObject(object);
			return ArrayUtils.compact(indices.map((i) => primitives[i]));
		} else {
			return [];
		}
	} else {
		return primitivesFromObject(object);
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

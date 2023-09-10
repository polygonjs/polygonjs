import {PolyDictionary} from '../../../../types/GlobalTypes';
import {ArrayUtils} from '../../../ArrayUtils';
import {CoreString} from '../../../String';
import {AttribSize, AttribType, GroupString} from '../../Constant';
import {coreVertexClassFactory, coreVertexInstanceFactory} from '../../CoreObjectFactory';
import {CoreGroup} from '../../Group';
import {CoreObjectType, ObjectContent} from '../../ObjectContent';
import {CoreVertex} from './CoreVertex';

export function vertices(coreGroup: CoreGroup) {
	return coreGroup
		.allCoreObjects()
		.map((o) => verticesFromObject(o.object()))
		.flat();
}
export function vertexAttribNamesFromCoreGroup(coreGroup: CoreGroup): string[] {
	const firstObject = coreGroup.allObjects()[0];
	if (firstObject) {
		return vertexAttributeNames(firstObject);
	} else {
		return [];
	}
}
export function vertexAttribSizesFromCoreGroup(coreGroup: CoreGroup): PolyDictionary<AttribSize> {
	const firstObject = coreGroup.allObjects()[0];
	if (firstObject) {
		return vertexAttributeSizes(firstObject);
	} else {
		return {};
	}
}
export function vertexAttribTypesFromCoreGroup(coreGroup: CoreGroup): PolyDictionary<AttribType> {
	const firstObject = coreGroup.allObjects()[0];
	if (firstObject) {
		return vertexAttributeTypes(firstObject);
	} else {
		return {};
	}
}

export function verticesFromObject<T extends CoreObjectType>(object: ObjectContent<T>): CoreVertex<T>[] {
	const vertexClass = coreVertexClassFactory(object);
	const verticesCount = vertexClass.verticesCount(object);
	const vertices: CoreVertex<T>[] = new Array(verticesCount);
	for (let i = 0; i < verticesCount; i++) {
		vertices[i] = coreVertexInstanceFactory(object, i);
	}
	return vertices;
}

export function verticesFromObjectFromGroup<T extends CoreObjectType>(
	object: ObjectContent<T>,
	group: GroupString
): CoreVertex<T>[] {
	if (group) {
		const indices = CoreString.indices(group);
		if (indices) {
			const vertices = verticesFromObject(object);
			return ArrayUtils.compact(indices.map((i) => vertices[i]));
		} else {
			return [];
		}
	} else {
		return verticesFromObject(object);
	}
}

export function vertexAttributeNames<T extends CoreObjectType>(object: ObjectContent<T>): string[] {
	const vertexClass = coreVertexClassFactory(object);
	const attributes = vertexClass.attributes(object);
	if (!attributes) {
		return [];
	}
	return Object.keys(attributes);
}
export function vertexAttributeSizes<T extends CoreObjectType>(object: ObjectContent<T>): PolyDictionary<AttribSize> {
	const vertexClass = coreVertexClassFactory(object);
	const attributes = vertexClass.attributes(object);
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
export function vertexAttributeTypes<T extends CoreObjectType>(object: ObjectContent<T>): PolyDictionary<AttribType> {
	const vertexClass = coreVertexClassFactory(object);
	const attributes = vertexClass.attributes(object);
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

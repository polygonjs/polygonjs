import {PolyDictionary} from '../../../../types/GlobalTypes';
import {arrayPushItems} from '../../../ArrayUtils';
import {stringToIndices} from '../../../String';
import {AttribSize, AttribType, GroupString} from '../../Constant';
import {coreVertexClassFactory, coreVertexInstanceFactory} from '../../CoreObjectFactory';
import {CoreGroup} from '../../Group';
import {CoreObjectType, ObjectContent} from '../../ObjectContent';
import {CoreVertex} from './CoreVertex';

const _indices: number[] = [];
const _tmpVertices: CoreVertex<CoreObjectType>[] = [];

export function vertices<T extends CoreObjectType>(coreGroup: CoreGroup, target: CoreVertex<T>[]): CoreVertex<T>[] {
	const allObjects = coreGroup.allObjects();

	target.length = 0;
	for (const object of allObjects) {
		verticesFromObject(object, _tmpVertices);
		arrayPushItems(_tmpVertices, target);
	}
	return target;
	// return coreGroup
	// 	.allCoreObjects()
	// 	.map((o) => verticesFromObject(o.object()))
	// 	.flat();
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
export function verticesCountFromObject<T extends CoreObjectType>(object: ObjectContent<T>): number {
	const vertexClass = coreVertexClassFactory(object);
	return vertexClass.entitiesCount(object);
}
export function verticesFromObject<T extends CoreObjectType>(
	object: ObjectContent<T>,
	target: CoreVertex<T>[]
): CoreVertex<T>[] {
	const vertexClass = coreVertexClassFactory(object);
	const verticesCount = vertexClass.entitiesCount(object);
	target.length = verticesCount;
	for (let i = 0; i < verticesCount; i++) {
		target[i] = coreVertexInstanceFactory(object, i);
	}
	return target;
}

export function verticesFromObjectFromGroup<T extends CoreObjectType>(
	object: ObjectContent<T>,
	group: GroupString,
	target: CoreVertex<T>[]
): CoreVertex<T>[] {
	if (group) {
		target.length = 0;
		stringToIndices(group, _indices);
		verticesFromObject(object, _tmpVertices);
		for (const index of _indices) {
			const vertex = _tmpVertices[index] as CoreVertex<T> | undefined;
			if (vertex) {
				target.push(vertex);
			}
		}
		return target;
	} else {
		return verticesFromObject(object, target);
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

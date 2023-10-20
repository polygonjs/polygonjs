import type {Box3} from 'three';
import {GeometryContainer} from '..//Geometry';
import {PolyDictionary, AttribValue} from '../../..//types/GlobalTypes';
import {
	corePointClassFactory,
	coreVertexClassFactory,
	corePrimitiveClassFactory,
	coreObjectClassFactory,
} from '../../..//core/geometry/CoreObjectFactory';
import {
	coreObjectsAttribSizesByName,
	coreObjectAttributeTypesByName,
} from '../../..//core/geometry/entities/object/BaseCoreObjectUtils';
import {addToSetAtEntry} from '../../../core/MapUtils';
import {setToArray} from '../../..//core/SetUtils';
import {ObjectData, AttribSize, AttribType} from '../../..//core/geometry/Constant';

function _firstObject(sopContainer: GeometryContainer) {
	const coreGroup = sopContainer.coreContent();
	if (!coreGroup) {
		return;
	}
	return coreGroup.allObjects()[0];
}

//
//
// POINT ATTRIBUTES
//
//
export function pointAttributeSizesByName(sopContainer: GeometryContainer) {
	const sizesByName: PolyDictionary<number> = {};
	const object = _firstObject(sopContainer);
	if (object) {
		const entityClass = corePointClassFactory(object);
		const attributeNames = entityClass.attributeNames(object);
		for (const attribName of attributeNames) {
			sizesByName[attribName] = entityClass.attribSize(object, attribName);
		}
	}
	return sizesByName;
}
export function pointAttributeTypesByName(sopContainer: GeometryContainer): PolyDictionary<AttribType> {
	const typesByName: PolyDictionary<AttribType> = {};
	const object = _firstObject(sopContainer);
	if (!object) {
		return typesByName;
	}
	const entityClass = corePointClassFactory(object);
	const attributes = entityClass.attributes(object);
	if (!attributes) {
		return typesByName;
	}
	const attribNames = Object.keys(attributes);
	for (const attribName of attribNames) {
		const attribType = entityClass.attribType(object, attribName);
		typesByName[attribName] = attribType;
	}
	return typesByName;
}

//
//
// VERTEX ATTRIBUTES
//
//
export function vertexAttributeSizesByName(sopContainer: GeometryContainer) {
	const sizesByName: PolyDictionary<number> = {};
	const object = _firstObject(sopContainer);
	if (object) {
		const entityClass = coreVertexClassFactory(object);
		const attributeNames = entityClass.attributeNames(object);
		for (const attribName of attributeNames) {
			sizesByName[attribName] = entityClass.attribSize(object, attribName);
		}
	}
	return sizesByName;
}
export function vertexAttributeTypesByName(sopContainer: GeometryContainer): PolyDictionary<AttribType> {
	const typesByName: PolyDictionary<AttribType> = {};
	const object = _firstObject(sopContainer);
	if (!object) {
		return typesByName;
	}
	const entityClass = coreVertexClassFactory(object);
	const attributes = entityClass.attributes(object);
	if (!attributes) {
		return typesByName;
	}
	const attribNames = Object.keys(attributes);
	for (const attribName of attribNames) {
		const attribType = entityClass.attribType(object, attribName);
		typesByName[attribName] = attribType;
	}
	return typesByName;
}

//
//
// PRIMITIVE ATTRIBUTES
//
//
export function primitiveAttributeSizesByName(sopContainer: GeometryContainer) {
	const sizesByName: PolyDictionary<number> = {};
	const object = _firstObject(sopContainer);
	if (object) {
		const entityClass = corePrimitiveClassFactory(object);
		const attributeNames = entityClass.attributeNames(object);
		for (const attribName of attributeNames) {
			sizesByName[attribName] = entityClass.attribSize(object, attribName);
		}
	}
	return sizesByName;
}
export function primitiveAttributeTypesByName(sopContainer: GeometryContainer): PolyDictionary<AttribType> {
	const typesByName: PolyDictionary<AttribType> = {};
	const object = _firstObject(sopContainer);
	if (!object) {
		return typesByName;
	}
	const entityClass = corePrimitiveClassFactory(object);
	const attributes = entityClass.attributes(object);
	if (!attributes) {
		return typesByName;
	}
	const attribNames = Object.keys(attributes);
	for (const attribName of attribNames) {
		const attribType = entityClass.attribType(object, attribName);
		typesByName[attribName] = attribType;
	}
	return typesByName;
}

//
//
// OBJECT ATTRIBUTES
//
//
export function objectAttributeSizesByName(sopContainer: GeometryContainer): PolyDictionary<AttribSize[]> | undefined {
	const coreGroup = sopContainer.coreContent();
	if (!coreGroup) {
		return;
	}
	return coreObjectsAttribSizesByName(coreGroup.allCoreObjects());
}
export function objectAttributeTypesByName(sopContainer: GeometryContainer): PolyDictionary<AttribType[]> | undefined {
	const coreGroup = sopContainer.coreContent();
	if (!coreGroup) {
		return;
	}
	return coreObjectAttributeTypesByName(coreGroup.allCoreObjects());
}
export function objectAttributeTypeAndSizesByName(
	sopContainer: GeometryContainer
): PolyDictionary<Record<AttribType, AttribSize[]>> | undefined {
	const _sizesByTypeByName: Map<string, Map<AttribType, Set<AttribSize>>> = new Map();
	const coreGroup = sopContainer.coreContent();
	if (!coreGroup) {
		return;
	}
	const objects = coreGroup.allObjects();
	for (const object of objects) {
		const coreObjectClass = coreObjectClassFactory(object);
		const objectAttriNames = coreObjectClass.attribNames(object);
		for (const attribName of objectAttriNames) {
			const attribType = coreObjectClass.attribType(object, attribName);
			const attribSize = coreObjectClass.attribSize(object, attribName);
			let mapForName = _sizesByTypeByName.get(attribName);
			if (!mapForName) {
				mapForName = new Map();
			}
			_sizesByTypeByName.set(attribName, mapForName);
			addToSetAtEntry(mapForName, attribType, attribSize);
		}
	}

	const sizesByTypeByName: PolyDictionary<Record<AttribType, AttribSize[]>> = {};
	_sizesByTypeByName.forEach((mapForName, attribName) => {
		// typesByName[attribName] = SetUtils.toArray(attribTypes);
		sizesByTypeByName[attribName] = {[AttribType.NUMERIC]: [], [AttribType.STRING]: []};
		mapForName.forEach((attribSizes, attribType) => {
			sizesByTypeByName[attribName][attribType] = setToArray(attribSizes, []);
		});
	});
	return sizesByTypeByName;
	// const core_object = this.firstCoreObject();
	// if (core_object) {
	// 	for (let name of core_object.attribNames()) {
	// 		types_by_name[name] = core_object.attribType(name);
	// 	}
	// }
	// return types_by_name;
}

//
//
// CORE GROUP ATTRIBUTES
//
//
export function coreGroupAttributeSizesByName(sopContainer: GeometryContainer) {
	const sizes_by_name: PolyDictionary<number> = {};
	const coreGroup = sopContainer.coreContent();
	if (coreGroup) {
		const attribNames = coreGroup.attribNames();
		for (const attribName of attribNames) {
			const size = coreGroup.attribSize(attribName);
			if (size != null) {
				sizes_by_name[attribName] = size;
			}
		}
	}
	return sizes_by_name;
}
export function coreGroupAttributeTypesByName(sopContainer: GeometryContainer) {
	const types_by_name: PolyDictionary<AttribType> = {};
	const coreGroup = sopContainer.coreContent();
	if (coreGroup) {
		const attribNames = coreGroup.attribNames();
		for (const attribName of attribNames) {
			types_by_name[attribName] = coreGroup.attribType(attribName);
		}
	}
	return types_by_name;
}

export function coreGroupAttributeValuesByName(sopContainer: GeometryContainer) {
	const valuesByName: PolyDictionary<AttribValue> = {};
	const coreGroup = sopContainer.coreContent();
	if (coreGroup) {
		const attribNames = coreGroup.attribNames();
		for (const attribName of attribNames) {
			valuesByName[attribName] = coreGroup.attribValue(attribName);
		}
	}
	return valuesByName;
}

export function objectsData(sopContainer: GeometryContainer): Array<ObjectData> {
	const coreGroup = sopContainer.coreContent();
	if (coreGroup) {
		return coreGroup.objectsData();
	} else {
		return [];
	}
}

export function totalPointsCount(sopContainer: GeometryContainer): number {
	const coreGroup = sopContainer.coreContent();
	if (coreGroup) {
		return coreGroup.totalPointsCount();
	} else {
		return 0;
	}
}

//
//
// MISC
//
//
export function boundingBox(sopContainer: GeometryContainer, target: Box3) {
	const coreGroup = sopContainer.coreContent();
	if (coreGroup) {
		return coreGroup.boundingBox(target);
	} else {
		target.makeEmpty();
	}
}

export function objectsCountByType(sopContainer: GeometryContainer) {
	const count_by_type: PolyDictionary<number> = {};
	const coreGroup = sopContainer.coreContent();
	if (coreGroup) {
		for (const core_object of coreGroup.allCoreObjects()) {
			const human_type = core_object.humanType();
			if (count_by_type[human_type] == null) {
				count_by_type[human_type] = 0;
			}
			count_by_type[human_type] += 1;
		}
	}
	return count_by_type;
}
export function objectsNamesByType(sopContainer: GeometryContainer) {
	const names_by_type: PolyDictionary<string[]> = {};
	const coreGroup = sopContainer.coreContent();
	if (coreGroup) {
		const coreObjects = coreGroup.allCoreObjects();
		for (const core_object of coreObjects) {
			const human_type = core_object.humanType();
			names_by_type[human_type] = names_by_type[human_type] || [];
			names_by_type[human_type].push(core_object.name());
		}
	}
	return names_by_type;
}
export function objectsVisibleCount(sopContainer: GeometryContainer): number {
	let count = 0;
	const coreGroup = sopContainer.coreContent();
	if (coreGroup) {
		const objects = coreGroup.allObjects();
		for (const object of objects) {
			if (object.visible) {
				count++;
			}
		}
	}
	return count;
}
export function pointsCount(sopContainer: GeometryContainer): number {
	const coreGroup = sopContainer.coreContent();
	if (coreGroup) {
		return coreGroup.pointsCount();
	} else {
		return 0;
	}
}
export function objectsCount(sopContainer: GeometryContainer): number {
	const coreGroup = sopContainer.coreContent();
	if (coreGroup) {
		return coreGroup.allObjects().length;
	} else {
		return 0;
	}
}

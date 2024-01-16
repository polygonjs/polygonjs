import type {Object3D} from 'three';
import {stringMatchMask} from '../String';
import {coreTypeIsNaN} from '../Type';
import {CorePath} from './CorePath';
import type {CoreGroup} from './Group';
import {BaseCoreObject} from './entities/object/BaseCoreObject';
import type {ThreejsCoreObject} from './modules/three/ThreejsCoreObject';
import {CoreObjectType, ObjectContent} from './ObjectContent';
import {coreObjectInstanceFactory} from './CoreObjectFactory';
import type {QuadObject} from './modules/quad/QuadObject';
interface GroupOptions {
	group: string;
}
export interface CoreMaskFilterOptions extends GroupOptions {
	invert?: boolean;
}
export function filterObjectsFromCoreGroup<T extends CoreObjectType>(
	coreGroup: CoreGroup,
	options: CoreMaskFilterOptions,
	coreObjects?: BaseCoreObject<T>[]
): ObjectContent<CoreObjectType>[] {
	return filterCoreObjects(options.group, coreObjects || coreGroup.allCoreObjects()).map(
		(o) => o.object(),
		options.invert
	);
}
export function filterCoreObjectsFromCoreGroup<T extends CoreObjectType>(
	coreGroup: CoreGroup,
	options: CoreMaskFilterOptions,
	coreObjects?: BaseCoreObject<T>[]
): BaseCoreObject<CoreObjectType>[] {
	return filterCoreObjects(options.group, coreObjects || coreGroup.allCoreObjects());
}
export function filterThreejsCoreObjectsFromCoreGroup(
	coreGroup: CoreGroup,
	options: CoreMaskFilterOptions,
	coreObjects?: ThreejsCoreObject[]
): ThreejsCoreObject[] {
	return filterCoreObjects(options.group, coreObjects || coreGroup.threejsCoreObjects()) as ThreejsCoreObject[];
}
export function isInGroup<T extends CoreObjectType>(unSanitizedGroupString: string, coreObject: BaseCoreObject<T>) {
	const group = unSanitizedGroupString.trim();
	if (group.length == 0) {
		return true;
	}

	if (coreObject.object.name == group) {
		return true;
	}
	if (stringMatchMask(coreObject.name(), group)) {
		return true;
	}

	const elements = group.split('=');
	const attribNameWithPrefix = elements[0];
	if (attribNameWithPrefix[0] == '@') {
		const attribName = attribNameWithPrefix.substring(1);
		const expectedAttribValue = elements[1];
		const currentAttribValue = coreObject.attribValue(attribName);
		return expectedAttribValue == currentAttribValue;
	}
	return false;
}

function filterCoreObjects<T extends CoreObjectType>(
	groupString: string,
	coreObjects: BaseCoreObject<T>[]
): BaseCoreObject<T>[] {
	groupString = groupString.trim();

	if (groupString == '') {
		return coreObjects;
	}
	const index = parseInt(groupString);
	if (!coreTypeIsNaN(index)) {
		const coreObject = coreObjects[index];
		if (coreObject) {
			return [coreObject];
		} else {
			return [];
		}
	}

	const selectedCoreObjects: Array<BaseCoreObject<T>> = [];

	for (const rootObject of coreObjects) {
		let added = false;
		const object = rootObject.object();
		if (object) {
			const objectsInMask = CorePath.objectsByMask(groupString, object);
			for (const objectInMask of objectsInMask) {
				const parent = objectInMask.parent;
				const index = parent ? parent.children.indexOf(objectInMask) : 0;
				const coreObject = coreObjectInstanceFactory<T>(objectInMask, index);
				selectedCoreObjects.push(coreObject);
				added = true;
			}
			const _isInGroup = isInGroup(groupString, rootObject);
			if (_isInGroup && !added) {
				selectedCoreObjects.push(rootObject);
			}
		}
	}
	return selectedCoreObjects;
}
export function filterThreejsObjects(coreGroup: CoreGroup, options: CoreMaskFilterOptions) {
	return filterObjectsFromCoreGroup(coreGroup, options, coreGroup.threejsCoreObjects()) as Object3D[];
}
export function filterThreejsOrQuadObjects(coreGroup: CoreGroup, options: CoreMaskFilterOptions) {
	return filterObjectsFromCoreGroup(coreGroup, options, coreGroup.threejsOrQuadCoreObjects()) as Array<
		Object3D | QuadObject
	>;
}
export function filterObjectsWithGroup(coreGroup: CoreGroup, options: GroupOptions) {
	return filterObjectsFromCoreGroup(coreGroup, {
		group: options.group,
	});
}
export function filterThreejsObjectsWithGroup(coreGroup: CoreGroup, options: GroupOptions) {
	return filterThreejsObjects(coreGroup, {
		group: options.group,
	});
}
export function filterThreejsOrQuadObjectsWithGroup(coreGroup: CoreGroup, options: GroupOptions) {
	return filterThreejsOrQuadObjects(coreGroup, {
		group: options.group,
	});
}
export class CoreMask {
	static filterObjects = filterObjectsFromCoreGroup;
	static filterCoreObjects = filterCoreObjectsFromCoreGroup;
	static filterThreejsObjects = filterThreejsObjects;
	static isInGroup = isInGroup;
}

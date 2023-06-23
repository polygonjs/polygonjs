import {Object3D} from 'three';
import {ArrayUtils} from '../ArrayUtils';
import {CoreString} from '../String';
import {CoreType, isBooleanTrue} from '../Type';
import {CorePath} from './CorePath';
import {CoreGroup} from './Group';
import {BaseCoreObject} from './_BaseObject';
import {CoreObjectType, ObjectContent} from './ObjectContent';
import {SetUtils} from '../SetUtils';
import {coreObjectInstanceFactory} from './CoreObjectFactory';

export interface CoreMaskFilterOptions {
	group: string;
	applyToChildren?: boolean;
}

export class CoreMask {
	static filterObjects<T extends CoreObjectType>(
		coreGroup: CoreGroup,
		options: CoreMaskFilterOptions,
		coreObjects?: BaseCoreObject<T>[]
	): ObjectContent<CoreObjectType>[] {
		const selectedTopObjects = this._filterCoreObjects(
			options.group,
			coreObjects || coreGroup.allCoreObjects()
		).map((o) => o.object());

		// check if children should be included
		const selectedObjects: Set<ObjectContent<CoreObjectType>> = new Set();
		if (options.applyToChildren != null && isBooleanTrue(options.applyToChildren)) {
			for (const selectedTopObject of selectedTopObjects) {
				selectedTopObject.traverse((object) => {
					selectedObjects.add(object);
				});
			}
		} else {
			for (const selectedTopObject of selectedTopObjects) {
				selectedObjects.add(selectedTopObject);
			}
		}

		return SetUtils.toArray(selectedObjects);
	}
	static filterCoreObjects<T extends CoreObjectType>(
		coreGroup: CoreGroup,
		options: CoreMaskFilterOptions,
		coreObjects?: BaseCoreObject<T>[]
	): BaseCoreObject<CoreObjectType>[] {
		const selectedTopObjects = this._filterCoreObjects(options.group, coreObjects || coreGroup.allCoreObjects());

		// check if children should be included
		const selectedObjects: Set<BaseCoreObject<CoreObjectType>> = new Set();
		if (options.applyToChildren != null && isBooleanTrue(options.applyToChildren)) {
			for (const selectedTopObject of selectedTopObjects) {
				selectedObjects.add(selectedTopObject);
				const object = selectedTopObject.object();
				let childIndex = 0;
				object.traverse((child) => {
					if (child != object) {
						const childCoreObject = coreObjectInstanceFactory<CoreObjectType>(child, childIndex);
						selectedObjects.add(childCoreObject);
						childIndex++;
					}
				});
			}
		} else {
			for (const selectedTopObject of selectedTopObjects) {
				selectedObjects.add(selectedTopObject);
			}
		}
		return SetUtils.toArray(selectedObjects);
	}
	static filterThreejsObjects(coreGroup: CoreGroup, options: CoreMaskFilterOptions) {
		return this.filterObjects(coreGroup, options, coreGroup.threejsCoreObjects()) as Object3D[];
	}

	static isInGroup<T extends CoreObjectType>(groupString: string, coreObject: BaseCoreObject<T>) {
		const group = groupString.trim();
		if (group.length == 0) {
			return true;
		}

		if (coreObject.object.name == group) {
			return true;
		}
		if (CoreString.matchMask(groupString, coreObject.name())) {
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
	private static _filterCoreObjects<T extends CoreObjectType>(
		groupString: string,
		coreObjects: BaseCoreObject<T>[]
	): BaseCoreObject<T>[] {
		groupString = groupString.trim();

		if (groupString == '') {
			return coreObjects;
		}
		const index = parseInt(groupString);
		if (!CoreType.isNaN(index)) {
			return ArrayUtils.compact([coreObjects[index]]);
		}

		const selectedCoreObjects: BaseCoreObject<T>[] = [];

		for (const rootObject of coreObjects) {
			const object = rootObject.object();
			if (object instanceof Object3D) {
				const objectsInMask = CorePath.objectsByMask(groupString, object) as Object3D[];
				for (const objectInMask of objectsInMask) {
					const coreObject = coreObjectInstanceFactory<T>(objectInMask);
					selectedCoreObjects.push(coreObject);
				}
			}
			const isInGroup = CoreMask.isInGroup(groupString, rootObject);
			if (isInGroup) {
				selectedCoreObjects.push(rootObject);
			}
		}

		return selectedCoreObjects;
	}
}

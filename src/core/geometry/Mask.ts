import {Object3D} from 'three';
import {ArrayUtils} from '../ArrayUtils';
import {CoreString} from '../String';
import {CoreType, isBooleanTrue} from '../Type';
import {CorePath} from './CorePath';
import {CoreGroup} from './Group';
import {CoreObject} from './Object';

export interface CoreMaskFilterOptions {
	group: string;
	applyToChildren?: boolean;
}

export class CoreMask {
	static filterObjects(coreGroup: CoreGroup, options: CoreMaskFilterOptions) {
		const selectedTopObjects = this.coreObjects(options.group, coreGroup).map((o) => o.object());

		// check if children should be included
		const selectedObjectsByUuid: Map<string, Object3D> = new Map();
		if (options.applyToChildren != null && isBooleanTrue(options.applyToChildren)) {
			for (const selectedTopObject of selectedTopObjects) {
				selectedTopObject.traverse((object) => {
					selectedObjectsByUuid.set(object.uuid, object);
				});
			}
		} else {
			for (const selectedTopObject of selectedTopObjects) {
				selectedObjectsByUuid.set(selectedTopObject.uuid, selectedTopObject);
			}
		}
		const selectedObjects: Object3D[] = [];
		selectedObjectsByUuid.forEach((object) => {
			selectedObjects.push(object);
		});

		return selectedObjects;
	}

	static isInGroup(groupString: string, coreObject: CoreObject) {
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
	static coreObjects(groupString: string, coreGroup: CoreGroup): CoreObject[] {
		groupString = groupString.trim();

		if (groupString == '') {
			return coreGroup.coreObjects();
		}
		const index = parseInt(groupString);
		if (!CoreType.isNaN(index)) {
			return ArrayUtils.compact([coreGroup.coreObjects()[index]]);
		}

		const selectedCoreObjects: CoreObject[] = [];
		const rootObjects = coreGroup.coreObjects();

		for (const rootObject of rootObjects) {
			const objectsInMask = CorePath.objectsByMask(groupString, rootObject.object());
			for (const objectInMask of objectsInMask) {
				selectedCoreObjects.push(new CoreObject(objectInMask, 0));
			}
			const isInGroup = CoreMask.isInGroup(groupString, rootObject);
			if (isInGroup) {
				selectedCoreObjects.push(rootObject);
			}
		}

		return selectedCoreObjects;
	}
}

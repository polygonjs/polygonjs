import {PolyScene} from '../PolyScene';
import {CoreString} from '../../../core/String';
import {Object3D} from 'three/src/core/Object3D';

export const ROOT_NAME = '/';

export class ObjectsController {
	constructor(private scene: PolyScene) {}

	findObjectByMask(mask: string): Object3D | undefined {
		return this.findObjectByMaskInObject(mask, this.scene.threejsScene());
	}
	findObjectByMaskInObject(mask: string, object: Object3D, objectPath: string = ''): Object3D | undefined {
		for (let child of object.children) {
			let childName = child.name;
			if (childName[0] == '/') {
				childName = childName.substr(1);
			}
			objectPath = objectPath[objectPath.length - 1] == '/' ? '' : objectPath;
			const path = `${objectPath}/${childName}`;
			if (CoreString.matchMask(path, mask)) {
				return child;
			}
			const grandChild = this.findObjectByMaskInObject(mask, child, path);
			if (grandChild) {
				return grandChild;
			}
		}
	}

	objectsByMask(mask: string): Object3D[] {
		return this.objectsByMaskInObject(mask, this.scene.threejsScene(), [], '');
	}
	objectsByMaskInObject(mask: string, object: Object3D, list: Object3D[] = [], objectPath: string = '') {
		for (let child of object.children) {
			const path = `${objectPath}/${child.name}`;
			if (CoreString.matchMask(path, mask)) {
				list.push(child);
			}
			this.objectsByMaskInObject(mask, child, list, path);
		}
		return list;
	}
}

import {PolyScene} from '../PolyScene';
import {CoreString} from '../../../core/String';
import {Object3D} from 'three/src/core/Object3D';

export class ObjectsController {
	constructor(private scene: PolyScene) {}

	findObjectByMask(mask: string): Object3D | undefined {
		return this.findObjectByMaskInObject(mask, this.scene.threejsScene());
	}
	findObjectByMaskInObject(mask: string, object: Object3D, objectPath: string = ''): Object3D | undefined {
		for (let child of object.children) {
			const childName = child.name;
			const separator = childName[0] == '/' ? '' : '/';
			const path = `${objectPath}${separator}${child.name}`;
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

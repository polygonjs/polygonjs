import {PolyScene} from '../PolyScene';
import {CoreString} from '../../../core/String';
import {Object3D} from 'three/src/core/Object3D';

export const ROOT_NAME = '/';

type ObjCallback = (obj: Object3D) => void;

export class ObjectsController {
	constructor(private scene: PolyScene) {}

	findObjectByMask(mask: string): Object3D | undefined {
		return this.findObjectByMaskInObject(mask, this.scene.threejsScene());
	}
	findObjectByMaskInObject(mask: string, object: Object3D, objectPath: string = ''): Object3D | undefined {
		for (let child of object.children) {
			const childName = this._removeTrailingOrHeadingSlash(child.name);
			objectPath = this._removeTrailingOrHeadingSlash(objectPath);
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
		const list: Object3D[] = [];
		this.traverseObjectsWithMask(mask, (obj) => {
			list.push(obj);
		});
		return list;
	}
	objectsByMaskInObject(mask: string, object: Object3D, list: Object3D[] = [], objectPath: string = '') {
		this.traverseObjectsWithMask(mask, (obj) => {
			list.push(obj);
		});
		return list;
	}
	traverseObjectsWithMask(mask: string, callback: ObjCallback, invertMask: boolean = false) {
		this.traverseObjectsWithMaskInObject(mask, this.scene.threejsScene(), callback, invertMask);
	}
	traverseObjectsWithMaskInObject(
		mask: string,
		object: Object3D,
		callback: ObjCallback,
		invertMask: boolean,
		objectPath: string = ''
	) {
		for (let child of object.children) {
			const childName = this._removeTrailingOrHeadingSlash(child.name);
			objectPath = this._removeTrailingOrHeadingSlash(objectPath);
			const path = `${objectPath}/${childName}`;
			let match = CoreString.matchMask(path, mask);
			if (invertMask) {
				match = !match;
			}
			if (match) {
				callback(child);
			}
			this.traverseObjectsWithMaskInObject(mask, child, callback, invertMask, path);
		}
	}

	private _removeTrailingOrHeadingSlash(objectName: string) {
		if (objectName[0] == '/') {
			objectName = objectName.substr(1);
		}
		if (objectName[objectName.length - 1] == '/') {
			objectName = objectName.substr(0, objectName.length - 1);
		}
		return objectName;
	}
}

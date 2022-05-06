import {PolyScene} from '../PolyScene';
import {CoreString} from '../../../core/String';
import {Object3D} from 'three';

export const ROOT_NAME = '/';

type ObjCallback = (obj: Object3D) => void;
const REGEX_PATH_SANITIZE = /\/+/g;

export class ObjectsController {
	constructor(private scene: PolyScene) {}

	findObjectByMask(mask: string): Object3D | undefined {
		return this.findObjectByMaskInObject(mask, this.scene.threejsScene());
	}
	findObjectByMaskInObject(mask: string, object: Object3D, objectPath: string = ''): Object3D | undefined {
		for (let child of object.children) {
			const childName = this._sanitizePath(child.name);
			const path = this._sanitizePath(`${objectPath}/${childName}`);
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
			const childName = this._sanitizePath(child.name);
			const path = this._sanitizePath(`${objectPath}/${childName}`);
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
	objectPath(object: Object3D): string {
		const parent = object.parent;
		if (parent) {
			const parentPath = this.objectPath(parent);
			return this._sanitizePath(`${parentPath}/${object.name}`);
		} else {
			return object.name;
		}
	}
	private _sanitizePath(path: string) {
		return path.replace(REGEX_PATH_SANITIZE, '/');
	}

	// private _removeTrailingOrHeadingSlash(objectName: string) {
	// 	if (objectName[0] == '/') {
	// 		objectName = objectName.substring(1);
	// 	}
	// 	if (objectName[objectName.length - 1] == '/') {
	// 		objectName = objectName.substring(0, objectName.length - 1);
	// 	}
	// 	return objectName;
	// }
}

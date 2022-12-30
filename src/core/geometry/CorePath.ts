import {CoreString} from '../String';
import {Object3D} from 'three';

export const ROOT_NAME = '/';

export type CorePathObjCallback = (obj: Object3D) => void;
const REGEX_PATH_SANITIZE = /\/+/g;

export class CorePath {
	static findObjectByMask(mask: string, parent: Object3D): Object3D | undefined {
		return this.findObjectByMaskInObject(mask, parent);
	}
	static findObjectByMaskInObject(mask: string, object: Object3D, objectPath: string = ''): Object3D | undefined {
		for (let child of object.children) {
			const childName = this.sanitizePath(child.name);
			const path = this.sanitizePath(`${objectPath}/${childName}`);
			if (CoreString.matchMask(path, mask)) {
				return child;
			}
			const grandChild = this.findObjectByMaskInObject(mask, child, path);
			if (grandChild) {
				return grandChild;
			}
		}
	}

	static objectsByMask(mask: string, parent: Object3D): Object3D[] {
		const list: Object3D[] = [];
		this.traverseObjectsWithMask(
			mask,
			(obj) => {
				list.push(obj);
			},
			parent
		);
		return list;
	}
	static objectsByMaskInObject(mask: string, object: Object3D, list: Object3D[] = [], objectPath: string = '') {
		this.traverseObjectsWithMask(
			mask,
			(obj) => {
				list.push(obj);
			},
			object
		);
		return list;
	}

	static traverseObjectsWithMask(
		mask: string,
		callback: CorePathObjCallback,
		object: Object3D,
		invertMask: boolean = false
	) {
		this.traverseObjectsWithMaskInObject(mask, object, callback, invertMask);
	}
	static traverseObjectsWithMaskInObject(
		mask: string,
		object: Object3D,
		callback: CorePathObjCallback,
		invertMask: boolean,
		objectPath?: string
	) {
		const objectName = this.sanitizePath(object.name);
		const path = this.sanitizePath(objectPath != null ? `${objectPath}/${objectName}` : objectName);
		let match = CoreString.matchMask(path, mask);
		if (invertMask) {
			match = !match;
		}
		if (match) {
			callback(object);
		}

		for (const child of object.children) {
			this.traverseObjectsWithMaskInObject(mask, child, callback, invertMask, path);
		}
	}
	static objectPath(object: Object3D, topParent?: Object3D): string {
		const parent = object.parent;
		if (parent && object != topParent) {
			const parentPath = this.objectPath(parent, topParent);
			return this.sanitizePath(`${parentPath}/${object.name}`);
		} else {
			return object.name;
		}
	}
	static sanitizePath(path: string) {
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

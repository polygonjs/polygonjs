import {CoreString} from '../String';
// import {Object3D} from 'three';
import {ObjectContent, CoreObjectType} from './ObjectContent';

export const ROOT_NAME = '/';

export type CorePathObjCallback<T extends CoreObjectType> = (obj: ObjectContent<T>) => void;
const REGEX_PATH_SANITIZE = /\/+/g;

export class CorePath {
	static findObjectByMask<T extends CoreObjectType>(mask: string, parent: ObjectContent<T>): ObjectContent<T> | undefined {
		return this.findObjectByMaskInObject(mask, parent);
	}
	static findObjectByMaskInObject<T extends CoreObjectType>(mask: string, object: ObjectContent<T>, objectPath: string = ''): ObjectContent<T> | undefined {
		for (let child of object.children) {
			const childName = this.sanitizePath(child.name);
			const path = this.sanitizePath(`${objectPath}/${childName}`);
			if (CoreString.matchMask(path, mask)) {
				return child;
			}
			const grandChild = this.findObjectByMaskInObject<T>(mask, child, path);
			if (grandChild) {
				return grandChild;
			}
		}
	}

	static objectsByMask<T extends CoreObjectType>(mask: string, parent: ObjectContent<T>):  ObjectContent<T>[] {
		const list:  ObjectContent<T>[] = [];
		this.traverseObjectsWithMask(
			mask,
			(obj) => {
				list.push(obj);
			},
			parent
		);
		return list;
	}
	static objectsByMaskInObject<T extends CoreObjectType>(mask: string, object:  ObjectContent<T>, list:  ObjectContent<T>[] = [], objectPath: string = '') {
		this.traverseObjectsWithMask(
			mask,
			(obj) => {
				list.push(obj);
			},
			object
		);
		return list;
	}

	static traverseObjectsWithMask<T extends CoreObjectType>(
		mask: string,
		callback: CorePathObjCallback<T>,
		object: ObjectContent<T>,
		invertMask: boolean = false
	) {
		this.traverseObjectsWithMaskInObject(mask, object, callback, invertMask);
	}
	static traverseObjectsWithMaskInObject<T extends CoreObjectType>(
		mask: string,
		object: ObjectContent<T>,
		callback: CorePathObjCallback<T>,
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
	static objectPath<T extends CoreObjectType>(object: ObjectContent<T>, topParent?: ObjectContent<T>): string {
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

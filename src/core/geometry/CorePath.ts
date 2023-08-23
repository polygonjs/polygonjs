import {stringMatchMask} from '../String';
import {ObjectContent, CoreObjectType} from './ObjectContent';

export const ROOT_NAME = '/';

export type CorePathObjCallback<T extends CoreObjectType> = (obj: ObjectContent<T>) => void;
const REGEX_PATH_SANITIZE = /\/+/g;

export function findObjectByMask<T extends CoreObjectType>(
	mask: string,
	parent: ObjectContent<T>
): ObjectContent<T> | undefined {
	return findObjectByMaskInObject(mask, parent);
}
export function findObjectByMaskInObject<T extends CoreObjectType>(
	mask: string,
	object: ObjectContent<T>,
	objectPath: string = ''
): ObjectContent<T> | undefined {
	for (let child of object.children) {
		const childName = sanitizeObjectPath(child.name);
		const path = sanitizeObjectPath(`${objectPath}/${childName}`);
		if (stringMatchMask(path, mask)) {
			return child;
		}
		const grandChild = findObjectByMaskInObject<T>(mask, child, path);
		if (grandChild) {
			return grandChild;
		}
	}
}
export function objectsByMask<T extends CoreObjectType>(
	mask: string,
	parent: ObjectContent<T>,
	invertMask: boolean = false
): ObjectContent<T>[] {
	const list: ObjectContent<T>[] = [];
	traverseObjectsWithMask(
		mask,
		(obj) => {
			list.push(obj);
		},
		parent,
		invertMask
	);
	return list;
}
export function objectsByMaskInObject<T extends CoreObjectType>(
	mask: string,
	object: ObjectContent<T>,
	list: ObjectContent<T>[] = [],
	objectPath: string = ''
) {
	traverseObjectsWithMask(
		mask,
		(obj) => {
			list.push(obj);
		},
		object
	);
	return list;
}
export function traverseObjectsWithMask<T extends CoreObjectType>(
	mask: string,
	callback: CorePathObjCallback<T>,
	object: ObjectContent<T>,
	invertMask: boolean = false
) {
	traverseObjectsWithMaskInObject(mask, object, callback, invertMask);
}
export function traverseObjectsWithMaskInObject<T extends CoreObjectType>(
	mask: string,
	object: ObjectContent<T>,
	callback: CorePathObjCallback<T>,
	invertMask: boolean,
	objectPath?: string
) {
	const objectName = sanitizeObjectPath(object.name);
	const path = sanitizeObjectPath(objectPath != null ? `${objectPath}/${objectName}` : objectName);
	let match = stringMatchMask(path, mask);
	if (invertMask) {
		match = !match;
	}
	if (match) {
		callback(object);
	}

	for (const child of object.children) {
		traverseObjectsWithMaskInObject(mask, child, callback, invertMask, path);
	}
}
export function sanitizeObjectPath(path: string) {
	return path.replace(REGEX_PATH_SANITIZE, '/');
}
export function objectPath<T extends CoreObjectType>(object: ObjectContent<T>, topParent?: ObjectContent<T>): string {
	const parent = object.parent;
	if (parent && object != topParent) {
		const parentPath = objectPath(parent, topParent);
		return sanitizeObjectPath(`${parentPath}/${object.name}`);
	} else {
		return object.name;
	}
}

export class CorePath {
	static findObjectByMask = findObjectByMask;
	static findObjectByMaskInObject = findObjectByMaskInObject;
	static objectsByMask = objectsByMask;
	static objectsByMaskInObject = objectsByMaskInObject;
	static traverseObjectsWithMask = traverseObjectsWithMask;
	static traverseObjectsWithMaskInObject = traverseObjectsWithMaskInObject;
	static objectPath = objectPath;
	static sanitizePath = sanitizeObjectPath;
}

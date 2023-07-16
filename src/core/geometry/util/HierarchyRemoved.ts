import {CoreObjectType, ObjectContent} from '../ObjectContent';
export function withChildrenRemoved<T>(object: ObjectContent<CoreObjectType>, callback: () => T) {
	const children = object.children;
	for (let child of children) {
		object.remove(child);
	}
	const result = callback();
	for (let child of children) {
		object.add(child);
	}
	return result;
}

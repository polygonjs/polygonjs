import {Object3D} from 'three';

type Callback = (object: Object3D) => void;
// this is a safer traversal, which does not break when children are removed within the callback
export function hierarchyTraverse(object: Object3D, callback: Callback) {
	callback(object);
	const childrenCount = object.children.length;
	for (let i = 0; i < childrenCount; i++) {
		const child = object.children[i];
		if (child) {
			hierarchyTraverse(child, callback);
		}
	}
}

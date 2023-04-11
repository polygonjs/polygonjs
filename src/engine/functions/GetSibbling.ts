import {Object3D} from 'three';
import {ObjectNamedFunction1} from './_Base';

export class getSibbling extends ObjectNamedFunction1<[number]> {
	static override type() {
		return 'getSibbling';
	}
	func(object3D: Object3D, offset: number) {
		const parent = object3D.parent || object3D;
		const children = parent.children;
		const currentIndex = children.indexOf(object3D);
		if (currentIndex < 0) {
			return object3D;
		}
		let index = currentIndex + offset;
		if (index >= children.length) {
			index = index % children.length;
		}
		const sibbling = children[index] || object3D;
		return sibbling;
	}
}

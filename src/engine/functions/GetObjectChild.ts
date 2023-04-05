import {Object3D} from 'three';
import {ObjectNamedFunction1} from './_Base';

export class getObjectChild extends ObjectNamedFunction1<[number]> {
	static override type() {
		return 'getObjectChild';
	}
	func(object3D: Object3D, index: number): Object3D {
		return object3D.children[index] || object3D.children[0] || object3D;
	}
}

import {Object3D} from 'three';
import {ObjectNamedFunction0} from './_Base';

export class getParent extends ObjectNamedFunction0 {
	static override type() {
		return 'getParent';
	}
	func(object3D: Object3D) {
		return object3D.parent || object3D;
	}
}

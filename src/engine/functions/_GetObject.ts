import {Object3D} from 'three';
import {ObjectNamedFunction2} from './_Base';

export class getObject extends ObjectNamedFunction2<[boolean, string]> {
	static override type() {
		return 'getObject';
	}
	func(object3D: Object3D, getCurrentObject: boolean, mask: string) {
		if (getCurrentObject) {
			return object3D;
		} else {
			return this.scene.findObjectByMask(mask) || object3D;
		}
	}
}

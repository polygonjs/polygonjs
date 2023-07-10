import {Object3D} from 'three';
import {ObjectNamedFunction0} from './_Base';
import {removeFromParent} from '../poly/PolyOnObjectsAddRemoveHooksController';

//
//
//
//
//
export class objectDelete extends ObjectNamedFunction0 {
	static override type() {
		return 'objectDelete';
	}
	func(object3D: Object3D): void {
		removeFromParent(this.scene, object3D);
	}
}

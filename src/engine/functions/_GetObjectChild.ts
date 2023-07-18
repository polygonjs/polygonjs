import {Object3D} from 'three';
import {ObjectNamedFunction1} from './_Base';
import {getObjectChildrenCountRef} from '../../core/reactivity/ObjectHierarchyReactivity';
import {dummyReadRefVal} from './_Param';

export class getObjectChild extends ObjectNamedFunction1<[number]> {
	static override type() {
		return 'getObjectChild';
	}
	func(object3D: Object3D, index: number): Object3D {
		dummyReadRefVal(getObjectChildrenCountRef(object3D).value);
		return object3D.children[index] || object3D.children[0] || object3D;
	}
}

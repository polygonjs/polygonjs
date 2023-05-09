import {Object3D} from 'three';
import {ObjectNamedFunction1} from './_Base';
import {getOrCreateUserDataRef} from '../../core/reactivity/ObjectUserDataReactivity';
import {dummyReadRefVal} from '../../core/reactivity/CoreReactivity';

export class getObjectUserData extends ObjectNamedFunction1<[string]> {
	static override type() {
		return 'getObjectUserData';
	}
	func(object3D: Object3D, userDataName: string): any {
		dummyReadRefVal(getOrCreateUserDataRef(object3D, userDataName).value);
		return object3D.userData[userDataName];
	}
}

import {Object3D} from 'three';
import {ObjectNamedFunction1} from './_Base';
import {_getObjectAttributeRef, _dummyReadAttributeRefVal} from '../../core/reactivity/ObjectAttributeReactivity';
import {Ref} from '@vue/reactivity';

export class getObjectAttributeRef extends ObjectNamedFunction1<[string]> {
	static override type() {
		return 'getObjectAttributeRef';
	}
	func(object3D: Object3D, attribName: string): Ref<number> {
		const _ref = _getObjectAttributeRef(object3D, attribName);
		return _ref;
	}
}

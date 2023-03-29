import {Object3D} from 'three';
import {CoreObject} from '../../core/geometry/Object';
import {ObjectNamedFunction1} from './_Base';
import {incrementRefSafely} from '../../core/reactivity/CoreReactivity';
import {_getObjectAttributeRef, _dummyReadAttributeRefVal} from '../../core/reactivity/ObjectAttributeReactivity';

export class getObjectAttribute extends ObjectNamedFunction1<[string]> {
	static override type() {
		return 'getObjectAttribute';
	}
	func(object3D: Object3D, attribName: string): any {
		const _ref = _getObjectAttributeRef(object3D, attribName);
		_dummyReadAttributeRefVal(_ref.value);
		return CoreObject.attribValue(object3D, attribName);
	}
}

export function touchObjectAttribute(object3D: Object3D, attribName: string) {
	const _ref = _getObjectAttributeRef(object3D, attribName);
	incrementRefSafely(_ref);
}

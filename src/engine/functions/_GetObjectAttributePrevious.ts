import {Object3D} from 'three';
import {ObjectNamedFunction2} from './_Base';
// import {incrementRefSafely} from '../../core/reactivity/CoreReactivity';
import {_getOrCreateObjectAttributeRef} from '../../core/reactivity/ObjectAttributeReactivityCreateRef';
import {AttribValue} from '../../types/GlobalTypes';
import {ParamConvertibleJsType} from '../nodes/utils/io/connections/Js';

export class getObjectAttributePrevious extends ObjectNamedFunction2<[string, ParamConvertibleJsType]> {
	static override type() {
		return 'getObjectAttributePrevious';
	}
	func(object3D: Object3D, attribName: string, type: ParamConvertibleJsType): AttribValue {
		const _ref = _getOrCreateObjectAttributeRef(object3D, attribName, type);
		// _dummyReadAttributeRefVal(_ref.value);
		return _ref.previous.value; // CoreObject.attribValue(object3D, attribName);
	}
}
// export class getObjectAttribute extends ObjectNamedFunction1<[string]> {
// 	static override type() {
// 		return 'getObjectAttribute';
// 	}
// 	func(object3D: Object3D, attribName: string): any {
// 		const _ref = _getObjectAttributeRef(object3D, attribName);
// 		_dummyReadAttributeRefVal(_ref.value);
// 		return CoreObject.attribValuep(object3D, attribName);
// 	}
// }

// export function touchObjectAttribute(object3D: Object3D, attribName: string) {
// 	// const _ref = _getObjectAttributeRef(object3D, attribName);
// 	// incrementRefSafely(_ref);
// }

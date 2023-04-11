import {Object3D} from 'three';
import {ObjectNamedFunction2} from './_Base';
import {_getOrCreateObjectAttributeRef} from '../../core/reactivity/ObjectAttributeReactivityCreateRef';
import {Ref} from '@vue/reactivity';
import {AttribValue} from '../../types/GlobalTypes';
import {ParamConvertibleJsType} from '../nodes/utils/io/connections/Js';

export class getObjectAttributeRef extends ObjectNamedFunction2<[string, ParamConvertibleJsType]> {
	static override type() {
		return 'getObjectAttributeRef';
	}
	func(object3D: Object3D, attribName: string, type: ParamConvertibleJsType): Ref<AttribValue> {
		const _ref = _getOrCreateObjectAttributeRef(object3D, attribName, type);
		return _ref.current;
	}
}

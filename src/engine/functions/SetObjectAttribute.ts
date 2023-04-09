import {Object3D} from 'three';
import {CoreObject} from '../../core/geometry/Object';
import {AttribValue} from '../../types/GlobalTypes';
// import {touchObjectAttribute} from './GetObjectAttribute';
import {_getObjectAttributeRef} from '../../core/reactivity/ObjectAttributeReactivity';
import {ObjectNamedFunction4} from './_Base';
import {_copyToRef} from './SetObjectAttributeRef';
import {ParamConvertibleJsType} from '../nodes/utils/io/connections/Js';
// import { attribValueNonPrimitive, copyAttribValue } from '../../core/geometry/_BaseObject';
// import {Ref} from '@vue/reactivity';

export class setObjectAttribute extends ObjectNamedFunction4<[string, number, AttribValue, ParamConvertibleJsType]> {
	static override type() {
		return 'setObjectAttribute';
	}
	func(
		object3D: Object3D,
		attribName: string,
		lerp: number,
		newValue: AttribValue,
		type: ParamConvertibleJsType
	): void {
		// const currentValue = CoreObject.attribValue(object3D, attribName)
		CoreObject.setAttribute(object3D, attribName, newValue);

		const _ref = _getObjectAttributeRef(object3D, attribName, type);
		_copyToRef(_ref.current.value, _ref.previous);
		_copyToRef(newValue, _ref.current);

		// if(attribValueNonPrimitive(currentValue) && attribValueNonPrimitive(newValue)){

		// }else{
		// 	(_getObjectAttributeRef(object3D, attribName, newValue).value as Vector3).copy(newValue as Vector3);
		// }

		// touchObjectAttribute(object3D, attribName);
	}
}

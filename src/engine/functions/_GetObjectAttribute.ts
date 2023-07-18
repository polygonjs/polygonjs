import {Object3D} from 'three';
import {ObjectNamedFunction2, ObjectNamedFunction3} from './_Base';
import {getOrCreateObjectAttributeRef} from '../../core/reactivity/ObjectAttributeReactivityCreateRef';
import {AttribValue} from '../../types/GlobalTypes';
import {JsIConnectionPointTypeToDataTypeMap, ParamConvertibleJsType} from '../nodes/utils/io/connections/Js';

export class getObjectAttribute<T extends ParamConvertibleJsType> extends ObjectNamedFunction3<
	[string, T, JsIConnectionPointTypeToDataTypeMap[T]]
> {
	static override type() {
		return 'getObjectAttribute';
	}
	func(
		object3D: Object3D,
		attribName: string,
		type: T,
		defaultValue: JsIConnectionPointTypeToDataTypeMap[T]
	): AttribValue {
		const _ref = getOrCreateObjectAttributeRef<T>(object3D, attribName, type, defaultValue);
		return _ref.current.value;
	}
}

export class getObjectAttributeAutoDefault<T extends ParamConvertibleJsType> extends ObjectNamedFunction2<[string, T]> {
	static override type() {
		return 'getObjectAttributeAutoDefault';
	}
	func(object3D: Object3D, attribName: string, type: T): AttribValue {
		const _ref = getOrCreateObjectAttributeRef<T>(object3D, attribName, type);
		return _ref.current.value;
	}
}

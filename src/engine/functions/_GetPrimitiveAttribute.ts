import {Object3D} from 'three';
import {ObjectNamedFunction4} from './_Base';
import {AttribValue} from '../../types/GlobalTypes';
import {JsIConnectionPointTypeToDataTypeMap, ParamConvertibleJsType} from '../nodes/utils/io/connections/Js';
import {primitiveClassFactoryNonAbstract} from '../../core/geometry/modules/three/ThreeModule';

export class getPrimitiveAttribute<T extends ParamConvertibleJsType> extends ObjectNamedFunction4<
	[number, string, T, JsIConnectionPointTypeToDataTypeMap[T]]
> {
	static override type() {
		return 'getPrimitiveAttribute';
	}
	func(
		object3D: Object3D,
		index: number,
		attribName: string,
		type: T,
		defaultValue: JsIConnectionPointTypeToDataTypeMap[T]
	): AttribValue {
		const primitiveClass = primitiveClassFactoryNonAbstract(object3D);
		if (!primitiveClass) {
			return defaultValue;
		}
		// TODO: add target for vector attributes
		const value = primitiveClass.attribValue(object3D, index, attribName /*, defaultValue as Vector3*/);
		console.log(index, value);
		if (value == null) {
			return defaultValue;
		}
		return value;
	}
}

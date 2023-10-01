import {ObjectXD, _getObjectAttributeRef_, refByObjectUuidByAttribName, AttribRefs} from './ObjectAttributeReactivity';
import {Color, Vector2, Vector3, Vector4} from 'three';
import {
	JsConnectionPointType,
	JsIConnectionPointTypeToDataTypeMap,
	ParamConvertibleJsType,
} from '../../engine/nodes/utils/io/connections/Js';
import {TypeAssert} from '../../engine/poly/Assert';
import {BaseCoreObject} from '../geometry/entities/object/BaseCoreObject';
import type {AttribValue} from '../../types/GlobalTypes';
import {ref} from './CoreReactivity';
import {Ref} from '@vue/reactivity';

function defaultValue<T extends ParamConvertibleJsType>(type: T): JsIConnectionPointTypeToDataTypeMap[T] {
	switch (type) {
		case JsConnectionPointType.BOOLEAN: {
			return false as JsIConnectionPointTypeToDataTypeMap[T];
		}
		case JsConnectionPointType.COLOR: {
			return new Color() as JsIConnectionPointTypeToDataTypeMap[T];
		}
		case JsConnectionPointType.FLOAT: {
			return 0 as JsIConnectionPointTypeToDataTypeMap[T];
		}
		case JsConnectionPointType.INT: {
			return 0 as JsIConnectionPointTypeToDataTypeMap[T];
		}
		case JsConnectionPointType.STRING: {
			return '' as JsIConnectionPointTypeToDataTypeMap[T];
		}
		case JsConnectionPointType.VECTOR2: {
			return new Vector2() as JsIConnectionPointTypeToDataTypeMap[T];
		}
		case JsConnectionPointType.VECTOR3: {
			return new Vector3() as JsIConnectionPointTypeToDataTypeMap[T];
		}
		case JsConnectionPointType.VECTOR4: {
			return new Vector4() as JsIConnectionPointTypeToDataTypeMap[T];
		}
	}
	TypeAssert.unreachable(type);
}
function cloneDefaultValue<T extends ParamConvertibleJsType>(
	value: JsIConnectionPointTypeToDataTypeMap[T],
	type: T
): JsIConnectionPointTypeToDataTypeMap[T] {
	switch (type) {
		case JsConnectionPointType.BOOLEAN: {
			return value as JsIConnectionPointTypeToDataTypeMap[T];
		}
		case JsConnectionPointType.COLOR: {
			return (value as Color).clone() as JsIConnectionPointTypeToDataTypeMap[T];
		}
		case JsConnectionPointType.FLOAT: {
			return value as JsIConnectionPointTypeToDataTypeMap[T];
		}
		case JsConnectionPointType.INT: {
			return value as JsIConnectionPointTypeToDataTypeMap[T];
		}
		case JsConnectionPointType.STRING: {
			return value as JsIConnectionPointTypeToDataTypeMap[T];
		}
		case JsConnectionPointType.VECTOR2: {
			return (value as Vector2).clone() as JsIConnectionPointTypeToDataTypeMap[T];
		}
		case JsConnectionPointType.VECTOR3: {
			return (value as Vector3).clone() as JsIConnectionPointTypeToDataTypeMap[T];
		}
		case JsConnectionPointType.VECTOR4: {
			return (value as Vector4).clone() as JsIConnectionPointTypeToDataTypeMap[T];
		}
	}
	TypeAssert.unreachable(type);
}

export function getOrCreateObjectAttributeRef<T extends ParamConvertibleJsType>(
	object3D: ObjectXD,
	attribName: string,
	type: T,
	defaultAttribValue?: JsIConnectionPointTypeToDataTypeMap[T]
): AttribRefs<T> {
	let mapForObject = refByObjectUuidByAttribName.get(object3D);
	if (!mapForObject) {
		mapForObject = new Map();
		refByObjectUuidByAttribName.set(object3D, mapForObject);
	}
	let refForAttribName: AttribRefs<T> = mapForObject.get(attribName) as AttribRefs<T>;
	if (!refForAttribName) {
		let _defaultValue = defaultAttribValue != null ? defaultAttribValue : defaultValue(type);
		let _previousValue = cloneDefaultValue(_defaultValue, type);
		const currentValue = BaseCoreObject.attribValue(
			object3D,
			attribName,
			0,
			_defaultValue as unknown as Vector2
		) as JsIConnectionPointTypeToDataTypeMap[T] | undefined;
		const previousValue = BaseCoreObject.attribValue(object3D, attribName, 0, _previousValue as any as Vector2) as
			| JsIConnectionPointTypeToDataTypeMap[T]
			| undefined;
		if (currentValue == null || previousValue == null) {
			refForAttribName = {
				current: ref(_defaultValue) as Ref<JsIConnectionPointTypeToDataTypeMap[T]>,
				previous: ref<JsIConnectionPointTypeToDataTypeMap[T]>(_previousValue) as Ref<
					JsIConnectionPointTypeToDataTypeMap[T]
				>,
			};
		} else {
			refForAttribName = {
				current: ref(currentValue) as Ref<JsIConnectionPointTypeToDataTypeMap[T]>,
				previous: ref(previousValue) as Ref<JsIConnectionPointTypeToDataTypeMap[T]>,
			};
		}
		mapForObject.set(attribName, refForAttribName);
	}
	return refForAttribName;
}
export function _dummyReadAttributeRefVal(value: AttribValue) {
	// 	// console.log('_dummyReadAttributeRefVal', value);
	// 	// we just need this method to force a call to .value
	// 	// and ensure that we have a dependency with the ref()
}

// export function touchObjectAttribute(object3D: Object3D, attribName: string) {
// 	// const _ref = _getObjectAttributeRef(object3D, attribName);
// 	// incrementRefSafely(_ref);
// }

import {Ref} from '@vue/reactivity';
import {Color, Object3D, Vector2, Vector3, Vector4} from 'three';
import {JsConnectionPointType, ParamConvertibleJsType} from '../../engine/nodes/utils/io/connections/Js';
import {TypeAssert} from '../../engine/poly/Assert';
import {AttribValue} from '../../types/GlobalTypes';
import {ref} from './CoreReactivity';
// import {CoreObject} from '../geometry/Object';

// JsConnectionPointType.BOOLEAN
// 	| JsConnectionPointType.COLOR
// 	| JsConnectionPointType.FLOAT
// 	| JsConnectionPointType.INT
// 	| JsConnectionPointType.STRING
// 	| JsConnectionPointType.VECTOR2
// 	| JsConnectionPointType.VECTOR3
// 	| JsConnectionPointType.VECTOR4;
function defaultValue(type: ParamConvertibleJsType) {
	switch (type) {
		case JsConnectionPointType.BOOLEAN: {
			return false;
		}
		case JsConnectionPointType.COLOR: {
			return new Color();
		}
		case JsConnectionPointType.FLOAT: {
			return 0;
		}
		case JsConnectionPointType.INT: {
			return 0;
		}
		case JsConnectionPointType.STRING: {
			return '';
		}
		case JsConnectionPointType.VECTOR2: {
			return new Vector2();
		}
		case JsConnectionPointType.VECTOR3: {
			return new Vector3();
		}
		case JsConnectionPointType.VECTOR4: {
			return new Vector4();
		}
	}
	TypeAssert.unreachable(type);
}

interface AttribRefs {
	current: Ref<AttribValue>;
	previous: Ref<AttribValue>;
}
const refByObjectUuidByAttribName: Map<string, Map<string, AttribRefs>> = new Map();
export function _getObjectAttributeRef(
	object3D: Object3D,
	attribName: string,
	type: ParamConvertibleJsType
): AttribRefs {
	// const _ref = CoreObject.attributesDictionaryEntry(object3D, attribName);
	// _dummyReadAttributeRefVal(_ref.value);
	// return _ref;
	let mapForObject = refByObjectUuidByAttribName.get(object3D.uuid);
	if (!mapForObject) {
		mapForObject = new Map();
		refByObjectUuidByAttribName.set(object3D.uuid, mapForObject);
	}
	let refForAttribName = mapForObject.get(attribName);
	if (!refForAttribName) {
		refForAttribName = {
			current: ref(defaultValue(type)),
			previous: ref(defaultValue(type)),
		};

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

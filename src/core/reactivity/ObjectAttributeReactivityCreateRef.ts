import {ObjectXD, _getObjectAttributeRef_, refByObjectUuidByAttribName, AttribRefs} from './ObjectAttributeReactivity';
import {Color, Vector2, Vector3, Vector4} from 'three';
import {JsConnectionPointType, ParamConvertibleJsType} from '../../engine/nodes/utils/io/connections/Js';
import {TypeAssert} from '../../engine/poly/Assert';
import {BaseCoreObject} from '../geometry/_BaseObject';
import type {AttribValue} from '../../types/GlobalTypes';

import {ref} from './CoreReactivity';

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

export function _getOrCreateObjectAttributeRef(
	object3D: ObjectXD,
	attribName: string,
	type: ParamConvertibleJsType
): AttribRefs {
	let mapForObject = refByObjectUuidByAttribName.get(object3D);
	if (!mapForObject) {
		mapForObject = new Map();
		refByObjectUuidByAttribName.set(object3D, mapForObject);
	}
	let refForAttribName = mapForObject.get(attribName);
	if (!refForAttribName) {
		let _defaultValue = defaultValue(type);
		let _previousValue = defaultValue(type);
		const currentValue = BaseCoreObject.attribValue(object3D, attribName, 0, _defaultValue as any as Vector2);
		const previousValue = BaseCoreObject.attribValue(object3D, attribName, 0, _previousValue as any as Vector2);
		if (currentValue == null || previousValue == null) {
			refForAttribName = {
				current: ref(defaultValue(type)),
				previous: ref(defaultValue(type)),
			};
		} else {
			refForAttribName = {
				current: ref(currentValue),
				previous: ref(previousValue),
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

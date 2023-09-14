import {Color, Object3D, Vector2, Vector3, Vector4} from 'three';
import {ThreejsObject} from '../../core/geometry/modules/three/ThreejsObject';
import {AttribValue} from '../../types/GlobalTypes';
import {_getObjectAttributeRef_} from '../../core/reactivity/ObjectAttributeReactivity';
import {ObjectNamedFunction4} from './_Base';
import {JsConnectionPointType, ParamConvertibleJsType} from '../nodes/utils/io/connections/Js';
import {TypeAssert} from '../poly/Assert';
import {mix} from '../../core/math/_Module';

const tmpColor = new Color();
const tmpV2 = new Vector2();
const tmpV3 = new Vector3();
const tmpV4 = new Vector4();

function _lerpAndGetValue(
	object3D: Object3D,
	attribName: string,
	lerp: number,
	newValue: AttribValue,
	type: ParamConvertibleJsType
): AttribValue {
	switch (type) {
		case JsConnectionPointType.BOOLEAN: {
			return newValue;
		}
		case JsConnectionPointType.COLOR: {
			ThreejsObject.attribValue(object3D, attribName, 0, tmpColor);
			tmpColor.lerp(newValue as Color, lerp);
			return tmpColor;
		}
		case JsConnectionPointType.FLOAT:
		case JsConnectionPointType.INT: {
			let currentValue = ThreejsObject.attribValue(object3D, attribName, 0) as number | undefined;
			if (currentValue == null) {
				currentValue = 0;
			}
			return mix(currentValue, newValue as number, lerp);
		}

		case JsConnectionPointType.STRING: {
			return newValue;
		}
		case JsConnectionPointType.VECTOR2: {
			ThreejsObject.attribValue(object3D, attribName, 0, tmpV2);
			tmpV2.lerp(newValue as Vector2, lerp);
			return tmpV2;
		}
		case JsConnectionPointType.VECTOR3: {
			ThreejsObject.attribValue(object3D, attribName, 0, tmpV3);
			tmpV3.lerp(newValue as Vector3, lerp);
			return tmpV3;
		}
		case JsConnectionPointType.VECTOR4: {
			ThreejsObject.attribValue(object3D, attribName, 0, tmpV4);
			tmpV4.lerp(newValue as Vector4, lerp);
			return tmpV4;
		}
	}
	TypeAssert.unreachable(type);
}

// function _copyToRef(attribValue: AttribValue, targetRef: Ref<AttribValue>) {
// 	if (attribValueNonPrimitive(attribValue) && attribValueNonPrimitive(targetRef.value)) {
// 		copyAttribValue(attribValue, targetRef.value);
// 	} else {
// 		targetRef.value = attribValue;
// 	}
// }
// function _updateRef(object3D: Object3D, attribName: string, newValue: AttribValue) {
// 	const _ref = _getObjectAttributeRef_(object3D, attribName, );
// 	if (!_ref) {
// 		return;
// 	}
// 	_copyToRef(_ref.current.value, _ref.previous);
// 	_copyToRef(newValue, _ref.current);
// }
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
		if (lerp >= 1) {
			ThreejsObject.setAttribute(object3D, attribName, newValue);
			// _updateRef(object3D, attribName, newValue, type);
		} else {
			const lerpedValue = _lerpAndGetValue(object3D, attribName, lerp, newValue, type);
			ThreejsObject.setAttribute(object3D, attribName, lerpedValue);
			// _updateRef(object3D, attribName, lerpedValue, type);
		}
	}
}

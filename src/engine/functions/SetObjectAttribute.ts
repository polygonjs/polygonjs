import {Color, Object3D, Vector2, Vector3, Vector4} from 'three';
import {CoreObject} from '../../core/geometry/Object';
import {AttribValue} from '../../types/GlobalTypes';
// import {touchObjectAttribute} from './GetObjectAttribute';
import {_getObjectAttributeRef} from '../../core/reactivity/ObjectAttributeReactivity';
import {ObjectNamedFunction4} from './_Base';
import {_copyToRef} from './SetObjectAttributeRef';
import {JsConnectionPointType, ParamConvertibleJsType} from '../nodes/utils/io/connections/Js';
import {TypeAssert} from '../poly/Assert';
import {mix} from '../../core/math/_Module';
// import { attribValueNonPrimitive, copyAttribValue } from '../../core/geometry/_BaseObject';
// import {Ref} from '@vue/reactivity';

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
			CoreObject.attribValue(object3D, attribName, 0, tmpColor);
			tmpColor.lerp(newValue as Color, lerp);
			return tmpColor;
		}
		case JsConnectionPointType.FLOAT:
		case JsConnectionPointType.INT: {
			const currentValue = CoreObject.attribValue(object3D, attribName, 0) as number;
			return mix(currentValue, newValue as number, lerp);
		}

		case JsConnectionPointType.STRING: {
			return newValue;
		}
		case JsConnectionPointType.VECTOR2: {
			CoreObject.attribValue(object3D, attribName, 0, tmpV2);
			tmpV2.lerp(newValue as Vector2, lerp);
			return tmpV2;
		}
		case JsConnectionPointType.VECTOR3: {
			CoreObject.attribValue(object3D, attribName, 0, tmpV3);
			tmpV3.lerp(newValue as Vector3, lerp);
			return tmpV3;
		}
		case JsConnectionPointType.VECTOR4: {
			CoreObject.attribValue(object3D, attribName, 0, tmpV4);
			tmpV4.lerp(newValue as Vector4, lerp);
			return tmpV4;
		}
	}
	TypeAssert.unreachable(type);
}

function _updateRef(object3D: Object3D, attribName: string, newValue: AttribValue, type: ParamConvertibleJsType) {
	const _ref = _getObjectAttributeRef(object3D, attribName, type);
	_copyToRef(_ref.current.value, _ref.previous);
	_copyToRef(newValue, _ref.current);
}
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
			CoreObject.setAttribute(object3D, attribName, newValue);
			_updateRef(object3D, attribName, newValue, type);
		} else {
			const lerpedValue = _lerpAndGetValue(object3D, attribName, lerp, newValue, type);
			CoreObject.setAttribute(object3D, attribName, lerpedValue);
			_updateRef(object3D, attribName, lerpedValue, type);
		}
	}
}

import {Vector4} from 'three/src/math/Vector4';
import {Vector3} from 'three/src/math/Vector3';
import {Vector2} from 'three/src/math/Vector2';
import {ParamType} from '../../../../poly/ParamType';
import {ParamInitValuesTypeMap} from '../../../../params/types/ParamInitValuesTypeMap';
import {TypeAssert} from '../../../../poly/Assert';
import {ParamConfig} from '../../../utils/code/configs/ParamConfig';
import {Color} from 'three/src/math/Color';

export class JsParamConfig<T extends ParamType> extends ParamConfig<T> {
	constructor(_type: T, _name: string, _default_value: ParamInitValuesTypeMap[T], private _uniform_name: string) {
		super(_type, _name, _default_value);
	}

	get uniform_name() {
		return this._uniform_name;
	}

	// TODO: refactor that to use the default values map?
	static uniform_by_type(type: ParamType) {
		switch (type) {
			case ParamType.BOOLEAN:
				return {value: 0};
			case ParamType.BUTTON:
				return {value: 0};
			case ParamType.COLOR:
				return {value: new Color(0, 0, 0)};
			case ParamType.FLOAT:
				return {value: 0};
			case ParamType.FOLDER:
				return {value: 0};
			case ParamType.INTEGER:
				return {value: 0};
			case ParamType.OPERATOR_PATH:
				return {value: 0};
			case ParamType.NODE_PATH:
				return {value: 0};
			case ParamType.PARAM_PATH:
				return {value: 0};
			// case ParamType.STRING: return {type: 't', value: null} // new Texture()}
			case ParamType.RAMP:
				return {value: null}; // new Texture()}
			case ParamType.STRING:
				return {value: null};
			case ParamType.VECTOR2:
				return {value: new Vector2(0, 0)};
			case ParamType.VECTOR3:
				return {value: new Vector3(0, 0, 0)};
			case ParamType.VECTOR4:
				return {value: new Vector4(0, 0, 0, 0)};
		}
		TypeAssert.unreachable(type);
	}
}

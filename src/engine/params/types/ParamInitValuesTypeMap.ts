import {StringOrNumber, StringOrNumber2, StringOrNumber3, StringOrNumber4} from '../../../types/GlobalTypes';
import {Vector2} from 'three';
import {Vector3} from 'three';
import {Vector4} from 'three';
import {Color} from 'three';
import {RampValue, RampValueJson} from '../ramp/RampValue';
import {ParamType} from '../../poly/ParamType';

type ParamInitValuesTypeMapGeneric = {[key in ParamType]: any};
export interface ParamInitValuesTypeMap extends ParamInitValuesTypeMapGeneric {
	[ParamType.BOOLEAN]: number | boolean | string;
	[ParamType.BUTTON]: null;
	[ParamType.COLOR]: StringOrNumber3 | Color;
	[ParamType.FLOAT]: StringOrNumber;
	[ParamType.FOLDER]: null;
	[ParamType.INTEGER]: StringOrNumber;
	[ParamType.PARAM_PATH]: string;
	[ParamType.NODE_PATH]: string;
	[ParamType.RAMP]: RampValue | RampValueJson;
	[ParamType.STRING]: string;
	[ParamType.VECTOR2]: StringOrNumber2 | Vector2;
	[ParamType.VECTOR3]: StringOrNumber3 | Vector3;
	[ParamType.VECTOR4]: StringOrNumber4 | Vector4;
}

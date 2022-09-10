import {Vector2} from 'three';
import {Vector3} from 'three';
import {Vector4} from 'three';
import {Color} from 'three';
import {RampValue} from '../ramp/RampValue';
import {ParamType} from '../../poly/ParamType';
import {TypedNodePathParamValue, TypedParamPathParamValue} from '../../../core/Walker';

type ParamValuesTypeMapGeneric = {[key in ParamType]: any};
export interface ParamValuesTypeMap extends ParamValuesTypeMapGeneric {
	[ParamType.BOOLEAN]: boolean;
	[ParamType.BUTTON]: null;
	[ParamType.COLOR]: Color;
	[ParamType.FLOAT]: number;
	[ParamType.FOLDER]: null;
	[ParamType.INTEGER]: number;
	[ParamType.PARAM_PATH]: TypedParamPathParamValue;
	[ParamType.NODE_PATH]: TypedNodePathParamValue;
	[ParamType.RAMP]: RampValue;
	[ParamType.STRING]: string;
	[ParamType.VECTOR2]: Vector2;
	[ParamType.VECTOR3]: Vector3;
	[ParamType.VECTOR4]: Vector4;
}

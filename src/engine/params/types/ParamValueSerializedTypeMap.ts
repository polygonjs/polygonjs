// import {BooleanParam} from '../Boolean';
// import {ButtonParam} from '../Button';
// import {ColorParam} from '../Color';
// import {FloatParam} from '../Float';
// import {IntegerParam} from '../Integer';
// import {OperatorPathParam} from '../OperatorPath';
// import {RampParam} from '../Ramp';
// import {SeparatorParam} from '../Separator';
// import {StringParam} from '../String';
// import {Vector2Param} from '../Vector2';
// import {Vector3Param} from '../Vector3';
// import {Vector4Param} from '../Vector4';
import {Number2, Number3, Number4} from '../../../types/GlobalTypes';
import {RampValueJson} from '../ramp/RampValue';
import {ParamType} from '../../poly/ParamType';
import {ParamInitValuesTypeMap} from './ParamInitValuesTypeMap';

// type ParamValueSerializedTypeMapGeneric = {[key in ParamType]: any};
export interface ParamValueSerializedTypeMap /*extends ParamValueSerializedTypeMapGeneric*/ {
	[ParamType.BOOLEAN]: boolean;
	[ParamType.BUTTON]: ParamInitValuesTypeMap[ParamType.BUTTON];
	[ParamType.COLOR]: Number3;
	[ParamType.FLOAT]: number;
	[ParamType.FOLDER]: null;
	[ParamType.INTEGER]: number;
	// [ParamType.OPERATOR_PATH]: ParamInitValuesTypeMap[ParamType.OPERATOR_PATH];
	[ParamType.NODE_PATH]: ParamInitValuesTypeMap[ParamType.NODE_PATH];
	[ParamType.PARAM_PATH]: ParamInitValuesTypeMap[ParamType.PARAM_PATH];
	[ParamType.RAMP]: RampValueJson;
	[ParamType.STRING]: ParamInitValuesTypeMap[ParamType.STRING];
	[ParamType.VECTOR2]: Number2;
	[ParamType.VECTOR3]: Number3;
	[ParamType.VECTOR4]: Number4;
}

// type ParamValuePreConversionSerializedTypeMapGeneric = {[key in ParamType]: any};
export interface ParamValuePreConversionSerializedTypeMap /*extends ParamValuePreConversionSerializedTypeMapGeneric*/ {
	[ParamType.BOOLEAN]: undefined;
	[ParamType.BUTTON]: undefined;
	[ParamType.COLOR]: Number3;
	[ParamType.FLOAT]: undefined;
	[ParamType.FOLDER]: undefined;
	[ParamType.INTEGER]: undefined;
	// [ParamType.OPERATOR_PATH]: undefined;
	[ParamType.NODE_PATH]: undefined;
	[ParamType.PARAM_PATH]: undefined;
	[ParamType.RAMP]: undefined;
	[ParamType.STRING]: undefined;
	[ParamType.VECTOR2]: undefined;
	[ParamType.VECTOR3]: undefined;
	[ParamType.VECTOR4]: undefined;
}

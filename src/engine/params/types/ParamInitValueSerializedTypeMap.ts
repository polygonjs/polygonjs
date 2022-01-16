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
import {StringOrNumber2, StringOrNumber3, StringOrNumber4} from '../../../types/GlobalTypes';
import {RampValueJson} from '../ramp/RampValue';
import {ParamType} from '../../poly/ParamType';
import {ParamInitValuesTypeMap} from './ParamInitValuesTypeMap';

// type ParamInitValueSerializedTypeMapGeneric = {[key in ParamType]: any};
export interface ParamInitValueSerializedTypeMap /*extends ParamInitValueSerializedTypeMapGeneric*/ {
	[ParamType.BOOLEAN]: ParamInitValuesTypeMap[ParamType.BOOLEAN];
	[ParamType.BUTTON]: ParamInitValuesTypeMap[ParamType.BUTTON];
	[ParamType.COLOR]: StringOrNumber3;
	[ParamType.FLOAT]: ParamInitValuesTypeMap[ParamType.FLOAT];
	[ParamType.FOLDER]: ParamInitValuesTypeMap[ParamType.FOLDER];
	[ParamType.INTEGER]: ParamInitValuesTypeMap[ParamType.INTEGER];
	// [ParamType.OPERATOR_PATH]: ParamInitValuesTypeMap[ParamType.OPERATOR_PATH];
	[ParamType.NODE_PATH]: ParamInitValuesTypeMap[ParamType.NODE_PATH];
	[ParamType.PARAM_PATH]: ParamInitValuesTypeMap[ParamType.PARAM_PATH];
	[ParamType.RAMP]: RampValueJson;
	[ParamType.STRING]: ParamInitValuesTypeMap[ParamType.STRING];
	[ParamType.VECTOR2]: StringOrNumber2;
	[ParamType.VECTOR3]: StringOrNumber3;
	[ParamType.VECTOR4]: StringOrNumber4;
}

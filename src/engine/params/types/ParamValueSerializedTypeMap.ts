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
import {RampValueJson} from '../ramp/RampValue';
import {ParamType} from '../../poly/ParamType';
import {ParamInitValuesTypeMap} from './ParamInitValuesTypeMap';

type ParamValueSerializedTypeMapGeneric = {[key in ParamType]: any};
export interface ParamValueSerializedTypeMap extends ParamValueSerializedTypeMapGeneric {
	[ParamType.BOOLEAN]: boolean;
	[ParamType.BUTTON]: ParamInitValuesTypeMap[ParamType.BUTTON];
	[ParamType.COLOR]: Number3;
	[ParamType.FLOAT]: number;
	[ParamType.FOLDER]: null;
	[ParamType.INTEGER]: number;
	[ParamType.OPERATOR_PATH]: ParamInitValuesTypeMap[ParamType.OPERATOR_PATH];
	[ParamType.RAMP]: RampValueJson;
	[ParamType.SEPARATOR]: ParamInitValuesTypeMap[ParamType.SEPARATOR];
	[ParamType.STRING]: ParamInitValuesTypeMap[ParamType.STRING];
	[ParamType.VECTOR2]: Number2;
	[ParamType.VECTOR3]: Number3;
	[ParamType.VECTOR4]: Number4;
}

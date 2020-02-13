// import {BooleanParam} from 'src/engine/params/Boolean';
// import {ButtonParam} from 'src/engine/params/Button';
// import {ColorParam} from 'src/engine/params/Color';
// import {FloatParam} from 'src/engine/params/Float';
// import {IntegerParam} from 'src/engine/params/Integer';
// import {OperatorPathParam} from 'src/engine/params/OperatorPath';
// import {RampParam} from 'src/engine/params/Ramp';
// import {SeparatorParam} from 'src/engine/params/Separator';
// import {StringParam} from 'src/engine/params/String';
// import {Vector2Param} from 'src/engine/params/Vector2';
// import {Vector3Param} from 'src/engine/params/Vector3';
// import {Vector4Param} from 'src/engine/params/Vector4';
import {RampValueJson} from 'src/engine/params/ramp/RampValue';
import {ParamType} from 'src/engine/poly/ParamType';

type ParamValueSerializedTypeMapGeneric = {[key in ParamType]: any};
export interface ParamValueSerializedTypeMap extends ParamValueSerializedTypeMapGeneric {
	[ParamType.BOOLEAN]: boolean | string;
	[ParamType.BUTTON]: null;
	[ParamType.COLOR]: StringOrNumber3;
	[ParamType.FLOAT]: StringOrNumber;
	[ParamType.INTEGER]: StringOrNumber;
	[ParamType.OPERATOR_PATH]: string;
	[ParamType.RAMP]: RampValueJson;
	[ParamType.SEPARATOR]: null;
	[ParamType.STRING]: string;
	[ParamType.VECTOR2]: StringOrNumber2;
	[ParamType.VECTOR3]: StringOrNumber3;
	[ParamType.VECTOR4]: StringOrNumber4;
}

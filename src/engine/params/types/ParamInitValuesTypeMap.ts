// import {BooleanParam} from 'src/engine/params/Boolean';
// import {ButtonParam} from 'src/engine/params/Button';
// import {ColorParam} from 'src/engine/params/Color';
// import {FloatParam} from 'src/engine/params/Float';
// import {IntegerParam} from 'src/engine/params/Integer';
// import {OperatorPathParam} from 'src/engine/params/OperatorPath';
// import {RampParam} from 'src/engine/params/Ramp';
// import {SeparatorParam} from 'src/engine/params/Separator';
import {Vector2} from 'three/src/math/Vector2';
import {Vector3} from 'three/src/math/Vector3';
import {Vector4} from 'three/src/math/Vector4';
import {Color} from 'three/src/math/Color';
import {RampValue, RampValueJson} from 'src/engine/params/ramp/RampValue';
import {ParamType} from 'src/engine/poly/ParamType';

type ParamInitValuesTypeMapGeneric = {[key in ParamType]: any};
export interface ParamInitValuesTypeMap extends ParamInitValuesTypeMapGeneric {
	[ParamType.BOOLEAN]: number | boolean | string;
	[ParamType.BUTTON]: null;
	[ParamType.COLOR]: StringOrNumber3 | Color;
	[ParamType.FLOAT]: StringOrNumber;
	[ParamType.INTEGER]: StringOrNumber;
	[ParamType.OPERATOR_PATH]: string;
	[ParamType.RAMP]: RampValue | RampValueJson;
	[ParamType.SEPARATOR]: null;
	[ParamType.STRING]: string;
	[ParamType.VECTOR2]: StringOrNumber2 | Vector2;
	[ParamType.VECTOR3]: StringOrNumber3 | Vector3;
	[ParamType.VECTOR4]: StringOrNumber4 | Vector4;
}

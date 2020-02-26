// import {BooleanParam} from '../Boolean';
// import {ButtonParam} from '../Button';
// import {ColorParam} from '../Color';
// import {FloatParam} from '../Float';
// import {IntegerParam} from '../Integer';
// import {OperatorPathParam} from '../OperatorPath';
// import {RampParam} from '../Ramp';
// import {SeparatorParam} from '../Separator';
import {Vector2} from 'three/src/math/Vector2';
import {Vector3} from 'three/src/math/Vector3';
import {Vector4} from 'three/src/math/Vector4';
import {Color} from 'three/src/math/Color';
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
	[ParamType.OPERATOR_PATH]: string;
	[ParamType.RAMP]: RampValue | RampValueJson;
	[ParamType.SEPARATOR]: null;
	[ParamType.STRING]: string;
	[ParamType.VECTOR2]: StringOrNumber2 | Vector2;
	[ParamType.VECTOR3]: StringOrNumber3 | Vector3;
	[ParamType.VECTOR4]: StringOrNumber4 | Vector4;
}

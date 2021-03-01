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
	[ParamType.OPERATOR_PATH]: string;
	[ParamType.PARAM_PATH]: TypedParamPathParamValue;
	[ParamType.NODE_PATH]: TypedNodePathParamValue;
	[ParamType.RAMP]: RampValue;
	[ParamType.STRING]: string;
	[ParamType.VECTOR2]: Vector2;
	[ParamType.VECTOR3]: Vector3;
	[ParamType.VECTOR4]: Vector4;
}

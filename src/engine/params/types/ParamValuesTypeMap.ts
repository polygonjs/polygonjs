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
import {RampValue} from '../ramp/RampValue';
import {ParamType} from 'src/engine/poly/ParamType';

type ParamValuesTypeMapGeneric = {[key in ParamType]: any};
export interface ParamValuesTypeMap extends ParamValuesTypeMapGeneric {
	[ParamType.BOOLEAN]: boolean;
	[ParamType.BUTTON]: null;
	[ParamType.COLOR]: Color;
	[ParamType.FLOAT]: number;
	[ParamType.FOLDER]: null;
	[ParamType.INTEGER]: number;
	[ParamType.OPERATOR_PATH]: string;
	[ParamType.RAMP]: RampValue;
	[ParamType.SEPARATOR]: null;
	[ParamType.STRING]: string;
	[ParamType.VECTOR2]: Vector2;
	[ParamType.VECTOR3]: Vector3;
	[ParamType.VECTOR4]: Vector4;
}

import {BooleanParam} from 'src/engine/params/Boolean';
import {ButtonParam} from 'src/engine/params/Button';
import {ColorParam} from 'src/engine/params/Color';
import {FloatParam} from 'src/engine/params/Float';
import {IntegerParam} from 'src/engine/params/Integer';
import {OperatorPathParam} from 'src/engine/params/OperatorPath';
import {RampParam} from 'src/engine/params/Ramp';
import {SeparatorParam} from 'src/engine/params/Separator';
import {StringParam} from 'src/engine/params/String';
import {Vector2Param} from 'src/engine/params/Vector2';
import {Vector3Param} from 'src/engine/params/Vector3';
import {Vector4Param} from 'src/engine/params/Vector4';
import {ParamType} from 'src/engine/poly/ParamType';
import {TypedParam} from '../_Base';

type ParamConstructorMapType = {[key in ParamType]: TypedParam<ParamType>};
export interface ParamConstructorMap extends ParamConstructorMapType {
	[ParamType.BOOLEAN]: BooleanParam;
	[ParamType.BUTTON]: ButtonParam;
	[ParamType.COLOR]: ColorParam;
	[ParamType.FLOAT]: FloatParam;
	[ParamType.INTEGER]: IntegerParam;
	[ParamType.OPERATOR_PATH]: OperatorPathParam;
	[ParamType.RAMP]: RampParam;
	[ParamType.SEPARATOR]: SeparatorParam;
	[ParamType.STRING]: StringParam;
	[ParamType.VECTOR2]: Vector2Param;
	[ParamType.VECTOR3]: Vector3Param;
	[ParamType.VECTOR4]: Vector4Param;
}

import {BooleanParam} from '../Boolean';
import {ButtonParam} from '../Button';
import {ColorParam} from '../Color';
import {FloatParam} from '../Float';
import {FolderParam} from '../Folder';
import {IntegerParam} from '../Integer';
import {OperatorPathParam} from '../OperatorPath';
import {ParamPathParam} from '../ParamPath';
import {NodePathParam} from '../NodePath';
import {RampParam} from '../Ramp';
import {SeparatorParam} from '../Separator';
import {StringParam} from '../String';
import {Vector2Param} from '../Vector2';
import {Vector3Param} from '../Vector3';
import {Vector4Param} from '../Vector4';
import {ParamType} from '../../poly/ParamType';
import {TypedParam} from '../_Base';

type ParamConstructorMapType = {[key in ParamType]: TypedParam<ParamType>};
export interface ParamConstructorMap extends ParamConstructorMapType {
	[ParamType.BOOLEAN]: BooleanParam;
	[ParamType.BUTTON]: ButtonParam;
	[ParamType.COLOR]: ColorParam;
	[ParamType.FLOAT]: FloatParam;
	[ParamType.FOLDER]: FolderParam;
	[ParamType.INTEGER]: IntegerParam;
	[ParamType.OPERATOR_PATH]: OperatorPathParam;
	[ParamType.PARAM_PATH]: ParamPathParam;
	[ParamType.NODE_PATH]: NodePathParam;
	[ParamType.RAMP]: RampParam;
	[ParamType.SEPARATOR]: SeparatorParam;
	[ParamType.STRING]: StringParam;
	[ParamType.VECTOR2]: Vector2Param;
	[ParamType.VECTOR3]: Vector3Param;
	[ParamType.VECTOR4]: Vector4Param;
}

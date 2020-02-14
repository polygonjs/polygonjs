// import {BooleanParam} from 'src/engine/params/Boolean';
// import {ButtonParam} from 'src/engine/params/Button';
// import {ColorParam} from 'src/engine/params/Color';
// import {FloatParam} from 'src/engine/params/Float';
// import {IntegerParam} from 'src/engine/params/Integer';
// import {OperatorPathParam} from 'src/engine/params/OperatorPath';
// import {RampParam} from 'src/engine/params/Ramp';
// import {SeparatorParam} from 'src/engine/params/Separator';
import {ParamType} from 'src/engine/poly/ParamType';
import {
	BooleanParamOptions,
	ButtonParamOptions,
	ColorParamOptions,
	FloatParamOptions,
	FolderParamOptions,
	IntegerParamOptions,
	OperatorPathParamOptions,
	RampParamOptions,
	SeparatorParamOptions,
	StringParamOptions,
	Vector2ParamOptions,
	Vector3ParamOptions,
	Vector4ParamOptions,
} from '../utils/OptionsController';

type ParamOptionsByTypeMapGeneric = {[key in ParamType]: object};
export interface ParamOptionsByTypeMap extends ParamOptionsByTypeMapGeneric {
	[ParamType.BOOLEAN]: BooleanParamOptions;
	[ParamType.BUTTON]: ButtonParamOptions;
	[ParamType.COLOR]: ColorParamOptions;
	[ParamType.FLOAT]: FloatParamOptions;
	[ParamType.FOLDER]: FolderParamOptions;
	[ParamType.INTEGER]: IntegerParamOptions;
	[ParamType.OPERATOR_PATH]: OperatorPathParamOptions;
	[ParamType.RAMP]: RampParamOptions;
	[ParamType.SEPARATOR]: SeparatorParamOptions;
	[ParamType.STRING]: StringParamOptions;
	[ParamType.VECTOR2]: Vector2ParamOptions;
	[ParamType.VECTOR3]: Vector3ParamOptions;
	[ParamType.VECTOR4]: Vector4ParamOptions;
}

import {BooleanParam} from '../../../params/Boolean';
import {ButtonParam} from '../../../params/Button';
import {ColorParam} from '../../../params/Color';
import {FloatParam} from '../../../params/Float';
import {FolderParam} from '../../../params/Folder';
import {IntegerParam} from '../../../params/Integer';
import {StringParam} from '../../../params/String';
import {Vector2Param} from '../../../params/Vector2';
import {Vector3Param} from '../../../params/Vector3';
import {Vector4Param} from '../../../params/Vector4';
import {ParamType} from '../../../poly/ParamType';
import {TypedParam} from '../../../params/_Base';

type ActorNodeParamConstructorMapType = {[key in ParamType]: TypedParam<ParamType>};
export interface ActorNodeParamConstructorMap extends ActorNodeParamConstructorMapType {
	[ParamType.BOOLEAN]: BooleanParam;
	[ParamType.BUTTON]: ButtonParam;
	[ParamType.COLOR]: ColorParam;
	[ParamType.FLOAT]: FloatParam;
	[ParamType.FOLDER]: FolderParam;
	[ParamType.INTEGER]: IntegerParam;
	[ParamType.STRING]: StringParam;
	[ParamType.VECTOR2]: Vector2Param;
	[ParamType.VECTOR3]: Vector3Param;
	[ParamType.VECTOR4]: Vector4Param;
}

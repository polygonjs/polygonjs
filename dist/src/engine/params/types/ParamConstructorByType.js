import {BooleanParam} from "../Boolean";
import {ButtonParam} from "../Button";
import {ColorParam} from "../Color";
import {FloatParam} from "../Float";
import {FolderParam} from "../Folder";
import {IntegerParam} from "../Integer";
import {OperatorPathParam} from "../OperatorPath";
import {NodePathParam} from "../NodePath";
import {RampParam} from "../Ramp";
import {SeparatorParam} from "../Separator";
import {StringParam} from "../String";
import {Vector2Param} from "../Vector2";
import {Vector3Param} from "../Vector3";
import {Vector4Param} from "../Vector4";
import {ParamType as ParamType2} from "../../poly/ParamType";
export const ParamConstructorByType = {
  [ParamType2.BOOLEAN]: BooleanParam,
  [ParamType2.BUTTON]: ButtonParam,
  [ParamType2.COLOR]: ColorParam,
  [ParamType2.FLOAT]: FloatParam,
  [ParamType2.FOLDER]: FolderParam,
  [ParamType2.INTEGER]: IntegerParam,
  [ParamType2.OPERATOR_PATH]: OperatorPathParam,
  [ParamType2.NODE_PATH]: NodePathParam,
  [ParamType2.RAMP]: RampParam,
  [ParamType2.SEPARATOR]: SeparatorParam,
  [ParamType2.STRING]: StringParam,
  [ParamType2.VECTOR2]: Vector2Param,
  [ParamType2.VECTOR3]: Vector3Param,
  [ParamType2.VECTOR4]: Vector4Param
};

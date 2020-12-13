import {ParamType as ParamType2} from "../../../../poly/ParamType";
import {RampParam} from "../../../../params/Ramp";
export var GlConnectionPointType;
(function(GlConnectionPointType2) {
  GlConnectionPointType2["BOOL"] = "bool";
  GlConnectionPointType2["INT"] = "int";
  GlConnectionPointType2["FLOAT"] = "float";
  GlConnectionPointType2["VEC2"] = "vec2";
  GlConnectionPointType2["VEC3"] = "vec3";
  GlConnectionPointType2["VEC4"] = "vec4";
  GlConnectionPointType2["SAMPLER_2D"] = "sampler2D";
})(GlConnectionPointType || (GlConnectionPointType = {}));
export const GL_CONNECTION_POINT_TYPES = [
  GlConnectionPointType.BOOL,
  GlConnectionPointType.INT,
  GlConnectionPointType.FLOAT,
  GlConnectionPointType.VEC2,
  GlConnectionPointType.VEC3,
  GlConnectionPointType.VEC4
];
export const GlConnectionPointTypeToParamTypeMap = {
  [GlConnectionPointType.BOOL]: ParamType2.BOOLEAN,
  [GlConnectionPointType.INT]: ParamType2.INTEGER,
  [GlConnectionPointType.FLOAT]: ParamType2.FLOAT,
  [GlConnectionPointType.VEC2]: ParamType2.VECTOR2,
  [GlConnectionPointType.VEC3]: ParamType2.VECTOR3,
  [GlConnectionPointType.VEC4]: ParamType2.VECTOR4,
  [GlConnectionPointType.SAMPLER_2D]: ParamType2.RAMP
};
export const GLParamTypeToConnectionPointTypeMap = {
  [ParamType2.BOOLEAN]: GlConnectionPointType.BOOL,
  [ParamType2.COLOR]: GlConnectionPointType.VEC3,
  [ParamType2.INTEGER]: GlConnectionPointType.INT,
  [ParamType2.FLOAT]: GlConnectionPointType.FLOAT,
  [ParamType2.FOLDER]: void 0,
  [ParamType2.VECTOR2]: GlConnectionPointType.VEC2,
  [ParamType2.VECTOR3]: GlConnectionPointType.VEC3,
  [ParamType2.VECTOR4]: GlConnectionPointType.VEC4,
  [ParamType2.BUTTON]: void 0,
  [ParamType2.OPERATOR_PATH]: void 0,
  [ParamType2.NODE_PATH]: void 0,
  [ParamType2.RAMP]: void 0,
  [ParamType2.SEPARATOR]: void 0,
  [ParamType2.STRING]: void 0
};
export const GlConnectionPointInitValueMap = {
  [GlConnectionPointType.BOOL]: false,
  [GlConnectionPointType.INT]: 0,
  [GlConnectionPointType.FLOAT]: 0,
  [GlConnectionPointType.VEC2]: [0, 0],
  [GlConnectionPointType.VEC3]: [0, 0, 0],
  [GlConnectionPointType.VEC4]: [0, 0, 0, 0],
  [GlConnectionPointType.SAMPLER_2D]: RampParam.DEFAULT_VALUE_JSON
};
export const GlConnectionPointComponentsCountMap = {
  [GlConnectionPointType.BOOL]: 1,
  [GlConnectionPointType.INT]: 1,
  [GlConnectionPointType.FLOAT]: 1,
  [GlConnectionPointType.VEC2]: 2,
  [GlConnectionPointType.VEC3]: 3,
  [GlConnectionPointType.VEC4]: 4,
  [GlConnectionPointType.SAMPLER_2D]: 1
};
import {BaseConnectionPoint} from "./_Base";
export class GlConnectionPoint extends BaseConnectionPoint {
  constructor(_name, _type, _init_value) {
    super(_name, _type);
    this._name = _name;
    this._type = _type;
    this._init_value = _init_value;
    this._init_value = this._init_value || GlConnectionPointInitValueMap[this._type];
  }
  get type() {
    return this._type;
  }
  are_types_matched(src_type, dest_type) {
    return src_type == dest_type;
  }
  get param_type() {
    return GlConnectionPointTypeToParamTypeMap[this._type];
  }
  get init_value() {
    return this._init_value;
  }
  to_json() {
    return this._json = this._json || this._create_json();
  }
  _create_json() {
    return {
      name: this._name,
      type: this._type
    };
  }
}

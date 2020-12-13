import {ParamType as ParamType2} from "../../../../poly/ParamType";
export var JsConnectionPointType;
(function(JsConnectionPointType2) {
  JsConnectionPointType2["BOOL"] = "bool";
  JsConnectionPointType2["INT"] = "int";
  JsConnectionPointType2["FLOAT"] = "float";
  JsConnectionPointType2["VEC2"] = "vec2";
  JsConnectionPointType2["VEC3"] = "vec3";
  JsConnectionPointType2["VEC4"] = "vec4";
})(JsConnectionPointType || (JsConnectionPointType = {}));
export const JS_CONNECTION_POINT_TYPES = [
  JsConnectionPointType.BOOL,
  JsConnectionPointType.INT,
  JsConnectionPointType.FLOAT,
  JsConnectionPointType.VEC2,
  JsConnectionPointType.VEC3,
  JsConnectionPointType.VEC4
];
export const JsConnectionPointTypeToParamTypeMap = {
  [JsConnectionPointType.BOOL]: ParamType2.BOOLEAN,
  [JsConnectionPointType.INT]: ParamType2.INTEGER,
  [JsConnectionPointType.FLOAT]: ParamType2.FLOAT,
  [JsConnectionPointType.VEC2]: ParamType2.VECTOR2,
  [JsConnectionPointType.VEC3]: ParamType2.VECTOR3,
  [JsConnectionPointType.VEC4]: ParamType2.VECTOR4
};
export const JsParamTypeToConnectionPointTypeMap = {
  [ParamType2.BOOLEAN]: JsConnectionPointType.BOOL,
  [ParamType2.COLOR]: JsConnectionPointType.VEC3,
  [ParamType2.INTEGER]: JsConnectionPointType.INT,
  [ParamType2.FLOAT]: JsConnectionPointType.FLOAT,
  [ParamType2.FOLDER]: void 0,
  [ParamType2.VECTOR2]: JsConnectionPointType.VEC2,
  [ParamType2.VECTOR3]: JsConnectionPointType.VEC3,
  [ParamType2.VECTOR4]: JsConnectionPointType.VEC4,
  [ParamType2.BUTTON]: void 0,
  [ParamType2.OPERATOR_PATH]: void 0,
  [ParamType2.NODE_PATH]: void 0,
  [ParamType2.RAMP]: void 0,
  [ParamType2.SEPARATOR]: void 0,
  [ParamType2.STRING]: void 0
};
export const JsConnectionPointInitValueMap = {
  [JsConnectionPointType.BOOL]: false,
  [JsConnectionPointType.INT]: 0,
  [JsConnectionPointType.FLOAT]: 0,
  [JsConnectionPointType.VEC2]: [0, 0],
  [JsConnectionPointType.VEC3]: [0, 0, 0],
  [JsConnectionPointType.VEC4]: [0, 0, 0, 0]
};
export const GlConnectionPointComponentsCountMap = {
  [JsConnectionPointType.BOOL]: 1,
  [JsConnectionPointType.INT]: 1,
  [JsConnectionPointType.FLOAT]: 1,
  [JsConnectionPointType.VEC2]: 2,
  [JsConnectionPointType.VEC3]: 3,
  [JsConnectionPointType.VEC4]: 4
};
import {BaseConnectionPoint} from "./_Base";
export class JsConnectionPoint extends BaseConnectionPoint {
  constructor(_name, _type) {
    super(_name, _type);
    this._name = _name;
    this._type = _type;
    this._init_value = JsConnectionPointInitValueMap[this._type];
  }
  get type() {
    return this._type;
  }
  are_types_matched(src_type, dest_type) {
    return src_type == dest_type;
  }
  get param_type() {
    return JsConnectionPointTypeToParamTypeMap[this._type];
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

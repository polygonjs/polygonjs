import {ParamType as ParamType2} from "../../../poly/ParamType";
import {RampParam} from "../../../params/Ramp";
import {Color as Color2} from "three/src/math/Color";
import {Vector2 as Vector22} from "three/src/math/Vector2";
import {Vector3 as Vector32} from "three/src/math/Vector3";
import {Vector4 as Vector42} from "three/src/math/Vector4";
export class ParamTemplate {
  constructor(type, init_value, options) {
    this.type = type;
    this.init_value = init_value;
    this.options = options;
  }
}
export class ParamConfig {
  static BUTTON(init_value, options) {
    return new ParamTemplate(ParamType2.BUTTON, init_value, options);
  }
  static BOOLEAN(init_value, options) {
    return new ParamTemplate(ParamType2.BOOLEAN, init_value, options);
  }
  static COLOR(init_value, options) {
    if (init_value instanceof Color2) {
      init_value = init_value.toArray();
    }
    return new ParamTemplate(ParamType2.COLOR, init_value, options);
  }
  static FLOAT(init_value, options) {
    return new ParamTemplate(ParamType2.FLOAT, init_value, options);
  }
  static FOLDER(init_value = null, options) {
    return new ParamTemplate(ParamType2.FOLDER, init_value, options);
  }
  static INTEGER(init_value, options) {
    return new ParamTemplate(ParamType2.INTEGER, init_value, options);
  }
  static RAMP(init_value = RampParam.DEFAULT_VALUE, options) {
    return new ParamTemplate(ParamType2.RAMP, init_value, options);
  }
  static SEPARATOR(init_value = null, options) {
    return new ParamTemplate(ParamType2.SEPARATOR, init_value, options);
  }
  static STRING(init_value = "", options) {
    return new ParamTemplate(ParamType2.STRING, init_value, options);
  }
  static VECTOR2(init_value, options) {
    if (init_value instanceof Vector22) {
      init_value = init_value.toArray();
    }
    return new ParamTemplate(ParamType2.VECTOR2, init_value, options);
  }
  static VECTOR3(init_value, options) {
    if (init_value instanceof Vector32) {
      init_value = init_value.toArray();
    }
    return new ParamTemplate(ParamType2.VECTOR3, init_value, options);
  }
  static VECTOR4(init_value, options) {
    if (init_value instanceof Vector42) {
      init_value = init_value.toArray();
    }
    return new ParamTemplate(ParamType2.VECTOR4, init_value, options);
  }
  static OPERATOR_PATH(init_value, options) {
    return new ParamTemplate(ParamType2.OPERATOR_PATH, init_value, options);
  }
  static NODE_PATH(init_value, options) {
    return new ParamTemplate(ParamType2.NODE_PATH, init_value, options);
  }
}
export class NodeParamsConfig {
}

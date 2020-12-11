import lodash_isArray from "lodash/isArray";
import lodash_isString from "lodash/isString";
import {AttribType} from "./Constant";
export class CoreAttributeData {
  constructor(_size, _type) {
    this._size = _size;
    this._type = _type;
  }
  size() {
    return this._size;
  }
  type() {
    return this._type;
  }
  static from_value(attrib_value) {
    const type = lodash_isString(attrib_value) ? AttribType.STRING : AttribType.NUMERIC;
    const size = lodash_isArray(attrib_value) ? attrib_value.length : 1;
    return new this(size, type);
  }
}

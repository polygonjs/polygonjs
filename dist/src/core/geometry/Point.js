import {Vector4 as Vector42} from "three/src/math/Vector4";
import {Vector3 as Vector32} from "three/src/math/Vector3";
import {Vector2 as Vector22} from "three/src/math/Vector2";
import {CoreAttribute} from "./Attribute";
import {CoreEntity} from "./Entity";
const ATTRIB_NAMES = {
  POSITION: "position",
  NORMAL: "normal"
};
var ComponentName;
(function(ComponentName2) {
  ComponentName2["x"] = "x";
  ComponentName2["y"] = "y";
  ComponentName2["z"] = "z";
  ComponentName2["w"] = "w";
  ComponentName2["r"] = "r";
  ComponentName2["g"] = "g";
  ComponentName2["b"] = "b";
})(ComponentName || (ComponentName = {}));
const COMPONENT_INDICES = {
  x: 0,
  y: 1,
  z: 2,
  w: 3,
  r: 0,
  g: 1,
  b: 2
};
const PTNUM = "ptnum";
const DOT = ".";
export class CorePoint extends CoreEntity {
  constructor(_core_geometry, index) {
    super(index);
    this._core_geometry = _core_geometry;
    this._geometry = this._core_geometry.geometry();
  }
  geometry_wrapper() {
    return this._core_geometry;
  }
  geometry() {
    return this._geometry = this._geometry || this._core_geometry.geometry();
  }
  attrib_size(name) {
    name = CoreAttribute.remap_name(name);
    return this._geometry.getAttribute(name).itemSize;
  }
  has_attrib(name) {
    const remapped_name = CoreAttribute.remap_name(name);
    return this._core_geometry.has_attrib(remapped_name);
  }
  attrib_value(name, target) {
    if (name === PTNUM) {
      return this.index;
    } else {
      let component_name = null;
      let component_index = null;
      if (name[name.length - 2] === DOT) {
        component_name = name[name.length - 1];
        component_index = COMPONENT_INDICES[component_name];
        name = name.substring(0, name.length - 2);
      }
      const remaped_name = CoreAttribute.remap_name(name);
      const attrib = this._geometry.getAttribute(remaped_name);
      if (attrib) {
        const {array} = attrib;
        if (this._core_geometry.is_attrib_indexed(remaped_name)) {
          return this.indexed_attrib_value(remaped_name);
        } else {
          const size = attrib.itemSize;
          const start_index = this._index * size;
          if (component_index == null) {
            switch (size) {
              case 1:
                return array[start_index];
                break;
              case 2:
                target = target || new Vector22();
                target.fromArray(array, start_index);
                return target;
                break;
              case 3:
                target = target || new Vector32();
                target.fromArray(array, start_index);
                return target;
                break;
              case 4:
                target = target || new Vector42();
                target.fromArray(array, start_index);
                return target;
                break;
              default:
                throw `size not valid (${size})`;
            }
          } else {
            switch (size) {
              case 1:
                return array[start_index];
                break;
              default:
                return array[start_index + component_index];
            }
          }
        }
      } else {
        const message = `attrib ${name} not found. availables are: ${Object.keys(this._geometry.attributes || {}).join(",")}`;
        console.warn(message);
        throw message;
      }
    }
  }
  indexed_attrib_value(name) {
    const value_index = this.attrib_value_index(name);
    return this._core_geometry.user_data_attrib(name)[value_index];
  }
  string_attrib_value(name) {
    return this.indexed_attrib_value(name);
  }
  attrib_value_index(name) {
    if (this._core_geometry.is_attrib_indexed(name)) {
      return this._geometry.getAttribute(name).array[this._index];
    } else {
      return -1;
    }
  }
  is_attrib_indexed(name) {
    return this._core_geometry.is_attrib_indexed(name);
  }
  position(target) {
    const {array} = this._geometry.getAttribute(ATTRIB_NAMES.POSITION);
    if (target) {
      return target.fromArray(array, this._index * 3);
    } else {
      this._position = this._position || new Vector32();
      return this._position.fromArray(array, this._index * 3);
    }
  }
  set_position(new_position) {
    this.set_attrib_value_vector3(ATTRIB_NAMES.POSITION, new_position);
  }
  normal() {
    const {array} = this._geometry.getAttribute(ATTRIB_NAMES.NORMAL);
    this._normal = this._normal || new Vector32();
    return this._normal.fromArray(array, this._index * 3);
  }
  set_normal(new_normal) {
    return this.set_attrib_value_vector3(ATTRIB_NAMES.NORMAL, new_normal);
  }
  set_attrib_value(name, value) {
    if (value == null) {
      return;
    }
    if (name == null) {
      throw "Point.set_attrib_value requires a name";
    }
    const attrib = this._geometry.getAttribute(name);
    const array = attrib.array;
    const attrib_size = attrib.itemSize;
    switch (attrib_size) {
      case 1:
        array[this._index] = value;
        break;
      case 2:
        const v2 = value;
        array[this._index * 2 + 0] = v2.x;
        array[this._index * 2 + 1] = v2.y;
        break;
      case 3:
        const is_color = value.r != null;
        if (is_color) {
          const col = value;
          array[this._index * 3 + 0] = col.r;
          array[this._index * 3 + 1] = col.g;
          array[this._index * 3 + 2] = col.b;
        } else {
          const v3 = value;
          array[this._index * 3 + 0] = v3.x;
          array[this._index * 3 + 1] = v3.y;
          array[this._index * 3 + 2] = v3.z;
        }
        break;
      default:
        console.warn(`Point.set_attrib_value does not yet allow attrib size ${attrib_size}`);
        throw `attrib size ${attrib_size} not implemented`;
    }
  }
  set_attrib_value_vector3(name, value) {
    if (value == null) {
      return;
    }
    if (name == null) {
      throw "Point.set_attrib_value requires a name";
    }
    const attrib = this._geometry.getAttribute(name);
    const array = attrib.array;
    const i = this._index * 3;
    array[i] = value.x;
    array[i + 1] = value.y;
    array[i + 2] = value.z;
  }
  set_attrib_index(name, new_value_index) {
    const array = this._geometry.getAttribute(name).array;
    return array[this._index] = new_value_index;
  }
}

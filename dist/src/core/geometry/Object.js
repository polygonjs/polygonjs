import {Vector2 as Vector22} from "three/src/math/Vector2";
import {Vector3 as Vector32} from "three/src/math/Vector3";
import {Vector4 as Vector42} from "three/src/math/Vector4";
import {Color as Color2} from "three/src/math/Color";
import {CoreGeometry} from "./Geometry";
import {CoreAttribute} from "./Attribute";
import {CoreConstant, AttribType, AttribSize} from "./Constant";
import {CoreMaterial} from "./Material";
import {CoreString} from "../String";
import lodash_cloneDeep from "lodash/cloneDeep";
import lodash_isString from "lodash/isString";
import lodash_isArray from "lodash/isArray";
import lodash_isNumber from "lodash/isNumber";
import {CoreEntity} from "./Entity";
const PTNUM = "ptnum";
const NAME_ATTR = "name";
const ATTRIBUTES = "attributes";
export class CoreObject extends CoreEntity {
  constructor(_object, index) {
    super(index);
    this._object = _object;
    if (this._object.userData[ATTRIBUTES] == null) {
      this._object.userData[ATTRIBUTES] = {};
    }
  }
  object() {
    return this._object;
  }
  geometry() {
    return this._object.geometry;
  }
  core_geometry() {
    const geo = this.geometry();
    if (geo) {
      return new CoreGeometry(geo);
    } else {
      return null;
    }
  }
  points() {
    return this.core_geometry()?.points() || [];
  }
  points_from_group(group) {
    if (group) {
      const indices = CoreString.indices(group);
      if (indices) {
        const points = this.points();
        return indices.map((i) => points[i]);
      } else {
        return [];
      }
    } else {
      return this.points();
    }
  }
  compute_vertex_normals() {
    this.core_geometry()?.compute_vertex_normals();
  }
  static add_attribute(object, attrib_name, value) {
    let data;
    if (value != null && !lodash_isNumber(value) && !lodash_isArray(value) && !lodash_isString(value)) {
      data = value.toArray();
    } else {
      data = value;
    }
    const user_data = object.userData;
    user_data[ATTRIBUTES] = user_data[ATTRIBUTES] || {};
    user_data[ATTRIBUTES][attrib_name] = data;
  }
  add_attribute(name, value) {
    CoreObject.add_attribute(this._object, name, value);
  }
  add_numeric_attrib(name, value) {
    this.add_attribute(name, value);
  }
  set_attrib_value(name, value) {
    this.add_attribute(name, value);
  }
  add_numeric_vertex_attrib(name, size, default_value) {
    if (default_value == null) {
      default_value = CoreAttribute.default_value(size);
    }
    this.core_geometry()?.add_numeric_attrib(name, size, default_value);
  }
  attribute_names() {
    return Object.keys(this._object.userData[ATTRIBUTES]);
  }
  attrib_names() {
    return this.attribute_names();
  }
  has_attrib(name) {
    return this.attribute_names().includes(name);
  }
  rename_attribute(old_name, new_name) {
    const current_value = this.attrib_value(old_name);
    if (current_value != null) {
      this.add_attribute(new_name, current_value);
      this.delete_attribute(old_name);
    } else {
      console.warn(`attribute ${old_name} not found`);
    }
  }
  delete_attribute(name) {
    delete this._object.userData[ATTRIBUTES][name];
  }
  static attrib_value(object, name, index = 0, target) {
    if (name === PTNUM) {
      return index;
    } else {
      if (object.userData && object.userData[ATTRIBUTES]) {
        const val = object.userData[ATTRIBUTES][name];
        if (val == null) {
          if (name == NAME_ATTR) {
            return object.name;
          }
        } else {
          if (lodash_isArray(val) && target) {
            target.fromArray(val);
            return target;
          }
        }
        return val;
      }
    }
  }
  static string_attrib_value(object, name, index = 0) {
    const str = this.attrib_value(object, name, index);
    if (str != null) {
      if (lodash_isString(str)) {
        return str;
      } else {
        return `${str}`;
      }
    }
  }
  attrib_value(name, target) {
    return CoreObject.attrib_value(this._object, name, this._index, target);
  }
  string_attrib_value(name) {
    return CoreObject.string_attrib_value(this._object, name, this._index);
  }
  name() {
    return this.attrib_value(NAME_ATTR);
  }
  human_type() {
    return CoreConstant.CONSTRUCTOR_NAMES_BY_CONSTRUCTOR_NAME[this._object.constructor.name];
  }
  attrib_types() {
    const h = {};
    for (let attrib_name of this.attrib_names()) {
      const type = this.attrib_type(attrib_name);
      if (type != null) {
        h[attrib_name] = type;
      }
    }
    return h;
  }
  attrib_type(name) {
    const val = this.attrib_value(name);
    if (lodash_isString(val)) {
      return AttribType.STRING;
    } else {
      return AttribType.NUMERIC;
    }
  }
  attrib_sizes() {
    const h = {};
    for (let attrib_name of this.attrib_names()) {
      const size = this.attrib_size(attrib_name);
      if (size != null) {
        h[attrib_name] = size;
      }
    }
    return h;
  }
  attrib_size(name) {
    const val = this.attrib_value(name);
    if (val == null) {
      return null;
    }
    if (lodash_isString(val) || lodash_isNumber(val)) {
      return AttribSize.FLOAT;
    } else {
      switch (val.constructor) {
        case Vector22:
          return AttribSize.VECTOR2;
        case Vector32:
          return AttribSize.VECTOR3;
        case Vector42:
          return AttribSize.VECTOR4;
        default:
          return null;
      }
    }
  }
  clone() {
    return CoreObject.clone(this._object);
  }
  static clone(src_object) {
    const new_object = src_object.clone();
    var sourceLookup = new Map();
    var cloneLookup = new Map();
    CoreObject.parallelTraverse(src_object, new_object, function(sourceNode, clonedNode) {
      sourceLookup.set(clonedNode, sourceNode);
      cloneLookup.set(sourceNode, clonedNode);
    });
    new_object.traverse(function(node) {
      const src_node = sourceLookup.get(node);
      const mesh_node = node;
      if (mesh_node.geometry) {
        const src_node_geometry = src_node.geometry;
        mesh_node.geometry = CoreGeometry.clone(src_node_geometry);
        const mesh_node_geometry = mesh_node.geometry;
        if (mesh_node_geometry.userData) {
          mesh_node_geometry.userData = lodash_cloneDeep(src_node_geometry.userData);
        }
      }
      if (mesh_node.material) {
        mesh_node.material = src_node.material;
        CoreMaterial.apply_custom_materials(node, mesh_node.material);
        const material_with_color = mesh_node.material;
        if (material_with_color.color == null) {
          material_with_color.color = new Color2(1, 1, 1);
        }
      }
      if (src_object.userData) {
        node.userData = lodash_cloneDeep(src_node.userData);
      }
      const src_node_with_animations = src_node;
      if (src_node_with_animations.animations) {
        node.animations = src_node_with_animations.animations.map((animation) => animation.clone());
      }
      const skinned_node = node;
      if (skinned_node.isSkinnedMesh) {
        var clonedMesh = skinned_node;
        var sourceMesh = src_node;
        var sourceBones = sourceMesh.skeleton.bones;
        clonedMesh.skeleton = sourceMesh.skeleton.clone();
        clonedMesh.bindMatrix.copy(sourceMesh.bindMatrix);
        const new_bones = sourceBones.map(function(bone) {
          return cloneLookup.get(bone);
        });
        clonedMesh.skeleton.bones = new_bones;
        clonedMesh.bind(clonedMesh.skeleton, clonedMesh.bindMatrix);
      }
    });
    return new_object;
  }
  static parallelTraverse(a, b, callback) {
    callback(a, b);
    for (var i = 0; i < a.children.length; i++) {
      this.parallelTraverse(a.children[i], b.children[i], callback);
    }
  }
}

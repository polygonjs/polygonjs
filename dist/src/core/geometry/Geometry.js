import {Vector3 as Vector32} from "three/src/math/Vector3";
import {Int32BufferAttribute} from "three/src/core/BufferAttribute";
import {Float32BufferAttribute} from "three/src/core/BufferAttribute";
import lodash_range from "lodash/range";
import lodash_chunk from "lodash/chunk";
import lodash_cloneDeep from "lodash/cloneDeep";
import lodash_clone from "lodash/clone";
import lodash_isArray from "lodash/isArray";
import lodash_isNumber from "lodash/isNumber";
import {CorePoint} from "./Point";
import {CoreFace} from "./Face";
import {ObjectType, AttribType} from "./Constant";
import {CoreAttribute} from "./Attribute";
import {CoreGeometryBuilderPoints} from "./builders/Points";
import {CoreGeometryBuilderMerge} from "./builders/Merge";
import {CoreGeometryBuilderMesh} from "./builders/Mesh";
import {CoreGeometryBuilderLineSegments} from "./builders/LineSegments";
import {TypeAssert} from "../../engine/poly/Assert";
const CoreGeometry2 = class {
  constructor(_geometry) {
    this._geometry = _geometry;
  }
  geometry() {
    return this._geometry;
  }
  uuid() {
    return this._geometry.uuid;
  }
  bounding_box() {
    return this._bounding_box = this._bounding_box || this._create_bounding_box();
  }
  _create_bounding_box() {
    this._geometry.computeBoundingBox();
    if (this._geometry.boundingBox) {
      return this._geometry.boundingBox;
    }
  }
  mark_as_instance() {
    this._geometry.userData["is_instance"] = true;
  }
  static marked_as_instance(geometry) {
    return geometry.userData["is_instance"] === true;
  }
  marked_as_instance() {
    return CoreGeometry2.marked_as_instance(this._geometry);
  }
  position_attrib_name() {
    let name = "position";
    if (this.marked_as_instance()) {
      name = "instancePosition";
    }
    return name;
  }
  compute_vertex_normals() {
    this._geometry.computeVertexNormals();
  }
  user_data_attribs() {
    const key = "indexed_attrib_values";
    return this._geometry.userData[key] = this._geometry.userData[key] || {};
  }
  indexed_attribute_names() {
    return Object.keys(this.user_data_attribs() || {});
  }
  user_data_attrib(name) {
    name = CoreAttribute.remap_name(name);
    return this.user_data_attribs()[name];
  }
  is_attrib_indexed(name) {
    name = CoreAttribute.remap_name(name);
    return this.user_data_attrib(name) != null;
  }
  has_attrib(name) {
    if (name === "ptnum") {
      return true;
    }
    name = CoreAttribute.remap_name(name);
    return this._geometry.attributes[name] != null;
  }
  attrib_type(name) {
    if (this.is_attrib_indexed(name)) {
      return AttribType.STRING;
    } else {
      return AttribType.NUMERIC;
    }
  }
  attrib_names() {
    return Object.keys(this._geometry.attributes);
  }
  attrib_sizes() {
    const h = {};
    for (let attrib_name of this.attrib_names()) {
      h[attrib_name] = this._geometry.attributes[attrib_name].itemSize;
    }
    return h;
  }
  attrib_size(name) {
    let attrib;
    name = CoreAttribute.remap_name(name);
    if ((attrib = this._geometry.attributes[name]) != null) {
      return attrib.itemSize;
    } else {
      if (name === "ptnum") {
        return 1;
      } else {
        return 0;
      }
    }
  }
  set_indexed_attribute_values(name, values) {
    this.user_data_attribs()[name] = values;
  }
  set_indexed_attribute(name, values, indices) {
    this.set_indexed_attribute_values(name, values);
    this._geometry.setAttribute(name, new Int32BufferAttribute(indices, 1));
  }
  add_numeric_attrib(name, size = 1, default_value = 0) {
    const values = [];
    let attribute_added = false;
    if (lodash_isNumber(default_value)) {
      for (let i = 0; i < this.points_count(); i++) {
        for (let j = 0; j < size; j++) {
          values.push(default_value);
        }
      }
      attribute_added = true;
    } else {
      if (size > 1) {
        if (lodash_isArray(default_value)) {
          for (let i = 0; i < this.points_count(); i++) {
            for (let j = 0; j < size; j++) {
              values.push(default_value[j]);
            }
          }
          attribute_added = true;
        } else {
          const vec2 = default_value;
          if (size == 2 && vec2.x != null && vec2.y != null) {
            for (let i = 0; i < this.points_count(); i++) {
              values.push(vec2.x);
              values.push(vec2.y);
            }
            attribute_added = true;
          }
          const vec3 = default_value;
          if (size == 3 && vec3.x != null && vec3.y != null && vec3.z != null) {
            for (let i = 0; i < this.points_count(); i++) {
              values.push(vec3.x);
              values.push(vec3.y);
              values.push(vec3.z);
            }
            attribute_added = true;
          }
          const col = default_value;
          if (size == 3 && col.r != null && col.g != null && col.b != null) {
            for (let i = 0; i < this.points_count(); i++) {
              values.push(col.r);
              values.push(col.g);
              values.push(col.b);
            }
            attribute_added = true;
          }
          const vec4 = default_value;
          if (size == 4 && vec4.x != null && vec4.y != null && vec4.z != null && vec4.w != null) {
            for (let i = 0; i < this.points_count(); i++) {
              values.push(vec4.x);
              values.push(vec4.y);
              values.push(vec4.z);
              values.push(vec4.w);
            }
            attribute_added = true;
          }
        }
      }
    }
    if (attribute_added) {
      this._geometry.setAttribute(name, new Float32BufferAttribute(values, size));
    } else {
      console.warn(default_value);
      throw `CoreGeometry.add_numeric_attrib error: no other default value allowed for now in add_numeric_attrib (default given: ${default_value})`;
    }
  }
  init_position_attribute(points_count, default_value) {
    const values = [];
    if (default_value == null) {
      default_value = new Vector32();
    }
    for (let i = 0; i < points_count; i++) {
      values.push(default_value.x);
      values.push(default_value.y);
      values.push(default_value.z);
    }
    return this._geometry.setAttribute("position", new Float32BufferAttribute(values, 3));
  }
  add_attribute(name, attrib_data) {
    switch (attrib_data.type()) {
      case AttribType.STRING:
        return console.log("TODO: to implement");
      case AttribType.NUMERIC:
        return this.add_numeric_attrib(name, attrib_data.size());
    }
  }
  rename_attribute(old_name, new_name) {
    if (this.is_attrib_indexed(old_name)) {
      this.user_data_attribs()[new_name] = lodash_clone(this.user_data_attribs()[old_name]);
      delete this.user_data_attribs()[old_name];
    }
    const old_attrib = this._geometry.getAttribute(old_name);
    this._geometry.setAttribute(new_name, new Float32BufferAttribute(old_attrib.array, old_attrib.itemSize));
    return this._geometry.deleteAttribute(old_name);
  }
  delete_attribute(name) {
    if (this.is_attrib_indexed(name)) {
      delete this.user_data_attribs()[name];
    }
    return this._geometry.deleteAttribute(name);
  }
  clone() {
    return CoreGeometry2.clone(this._geometry);
  }
  static clone(src_geometry) {
    let src_userData;
    const new_geometry = src_geometry.clone();
    if ((src_userData = src_geometry.userData) != null) {
      new_geometry.userData = lodash_cloneDeep(src_userData);
    }
    return new_geometry;
  }
  points_count() {
    return CoreGeometry2.points_count(this._geometry);
  }
  static points_count(geometry) {
    let position;
    let count = 0;
    const core_geometry = new this(geometry);
    let position_attrib_name = "position";
    if (core_geometry.marked_as_instance()) {
      position_attrib_name = "instancePosition";
    }
    if ((position = geometry.getAttribute(position_attrib_name)) != null) {
      let array;
      if ((array = position.array) != null) {
        count = array.length / 3;
      }
    }
    return count;
  }
  points() {
    return this._points = this._points || this.points_from_geometry();
  }
  reset_points() {
    this._points = void 0;
  }
  points_from_geometry() {
    const points = [];
    const position_attrib = this._geometry.getAttribute(this.position_attrib_name());
    if (position_attrib != null) {
      const points_count = position_attrib.array.length / 3;
      for (let point_index = 0; point_index < points_count; point_index++) {
        const point = new CorePoint(this, point_index);
        points.push(point);
      }
    }
    return points;
  }
  static geometry_from_points(points, object_type) {
    switch (object_type) {
      case ObjectType.MESH:
        return this._mesh_builder.from_points(points);
      case ObjectType.POINTS:
        return this._points_builder.from_points(points);
      case ObjectType.LINE_SEGMENTS:
        return this._lines_segment_builder.from_points(points);
      case ObjectType.OBJECT3D:
        return null;
      case ObjectType.LOD:
        return null;
    }
    TypeAssert.unreachable(object_type);
  }
  static merge_geometries(geometries) {
    return CoreGeometryBuilderMerge.merge(geometries);
  }
  segments() {
    const index = this.geometry().index?.array || [];
    return lodash_chunk(index, 2);
  }
  faces() {
    return this.faces_from_geometry();
  }
  faces_from_geometry() {
    const index_array = this.geometry().index?.array || [];
    const faces_count = index_array.length / 3;
    return lodash_range(faces_count).map((i) => new CoreFace(this, i));
  }
};
export let CoreGeometry = CoreGeometry2;
CoreGeometry._mesh_builder = new CoreGeometryBuilderMesh();
CoreGeometry._points_builder = new CoreGeometryBuilderPoints();
CoreGeometry._lines_segment_builder = new CoreGeometryBuilderLineSegments();

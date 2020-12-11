import lodash_uniq from "lodash/uniq";
import lodash_compact from "lodash/compact";
import lodash_isNaN from "lodash/isNaN";
import lodash_trim from "lodash/trim";
import lodash_flatten from "lodash/flatten";
import lodash_sum from "lodash/sum";
import {Vector3 as Vector32} from "three/src/math/Vector3";
import {Group as Group2} from "three/src/objects/Group";
import {Box3 as Box32} from "three/src/math/Box3";
import {CoreObject} from "./Object";
import {CoreGeometry} from "./Geometry";
import {CoreAttribute} from "./Attribute";
import {CoreString} from "../String";
import {CoreConstant, object_type_from_constructor} from "./Constant";
export class CoreGroup {
  constructor() {
    this._objects = [];
    this._objects_with_geo = [];
    this.touch();
  }
  timestamp() {
    return this._timestamp;
  }
  touch() {
    this._timestamp = performance.now();
    this.reset();
  }
  reset() {
    this._bounding_box = void 0;
    this._core_geometries = void 0;
    this._core_objects = void 0;
  }
  clone() {
    const core_group = new CoreGroup();
    if (this._objects) {
      const objects = [];
      for (let object of this._objects) {
        objects.push(CoreObject.clone(object));
      }
      core_group.set_objects(objects);
    }
    return core_group;
  }
  set_objects(objects) {
    this._objects = objects;
    this._objects_with_geo = objects.filter((obj) => obj.geometry != null);
    this.touch();
  }
  objects() {
    return this._objects;
  }
  objects_with_geo() {
    return this._objects_with_geo;
  }
  core_objects() {
    return this._core_objects = this._core_objects || this._create_core_objects();
  }
  _create_core_objects() {
    if (this._objects) {
      return this._objects.map((object, i) => new CoreObject(object, i));
    }
    return [];
  }
  objects_data() {
    if (this._objects) {
      return this._objects.map((object) => this._object_data(object));
    }
    return [];
  }
  _object_data(object) {
    let points_count = 0;
    if (object.geometry) {
      points_count = CoreGeometry.points_count(object.geometry);
    }
    return {
      type: object_type_from_constructor(object.constructor),
      name: object.name,
      children_count: object.children.length,
      points_count
    };
  }
  geometries() {
    const list = [];
    for (let core_object of this.core_objects()) {
      const geometry = core_object.object().geometry;
      if (geometry) {
        list.push(geometry);
      }
    }
    return list;
  }
  core_geometries() {
    return this._core_geometries = this._core_geometries || this.create_core_geometries();
  }
  create_core_geometries() {
    const list = [];
    for (let geometry of this.geometries()) {
      list.push(new CoreGeometry(geometry));
    }
    return list;
  }
  __geometry_from_object(list, object) {
    if (object.geometry) {
      return list.push(object.geometry);
    }
  }
  static geometry_from_object(object) {
    if (object.isMesh || object.isLine || object.isPoints) {
      return object.geometry;
    }
    return null;
  }
  faces() {
    return lodash_flatten(this.core_geometries().map((g) => g.faces()));
  }
  points() {
    return lodash_flatten(this.core_geometries().map((g) => g.points()));
  }
  points_count() {
    return lodash_sum(this.core_geometries().map((g) => g.points_count()));
  }
  total_points_count() {
    if (this._objects) {
      let sum2 = 0;
      for (let object of this._objects) {
        object.traverse((object2) => {
          const geometry = object2.geometry;
          if (geometry) {
            sum2 += CoreGeometry.points_count(geometry);
          }
        });
      }
      return sum2;
    } else {
      return 0;
    }
  }
  points_from_group(group) {
    if (group) {
      const indices = CoreString.indices(group);
      const points = this.points();
      return lodash_compact(indices.map((i) => points[i]));
    } else {
      return this.points();
    }
  }
  static from_objects(objects) {
    const core_group = new CoreGroup();
    core_group.set_objects(objects);
    return core_group;
  }
  objects_from_group(group_name) {
    return this.core_objects_from_group(group_name).map((co) => co.object());
  }
  core_objects_from_group(group_name) {
    group_name = lodash_trim(group_name);
    if (group_name !== "") {
      const index = parseInt(group_name);
      if (!lodash_isNaN(index)) {
        return lodash_compact([this.core_objects()[index]]);
      } else {
        return this.core_objects().filter((core_object) => {
          return CoreString.match_mask(group_name, core_object.name());
        });
      }
    } else {
      return this.core_objects();
    }
  }
  bounding_box() {
    return this._bounding_box = this._bounding_box || this._compute_bounding_box();
  }
  center() {
    const center = new Vector32();
    this.bounding_box().getCenter(center);
    return center;
  }
  size() {
    const size = new Vector32();
    this.bounding_box().getSize(size);
    return size;
  }
  _compute_bounding_box() {
    let bbox;
    if (this._objects) {
      for (let object of this._objects) {
        const geometry = object.geometry;
        if (geometry) {
          geometry.computeBoundingBox();
          if (bbox) {
            bbox.expandByObject(object);
          } else {
            if (geometry.boundingBox) {
              bbox = geometry.boundingBox.clone();
            }
          }
        }
      }
    }
    bbox = bbox || new Box32(new Vector32(-1, -1, -1), new Vector32(1, 1, 1));
    return bbox;
  }
  compute_vertex_normals() {
    for (let object of this.core_objects()) {
      object.compute_vertex_normals();
    }
  }
  has_attrib(name) {
    let first_geometry;
    if ((first_geometry = this.core_geometries()[0]) != null) {
      return first_geometry.has_attrib(name);
    } else {
      return false;
    }
  }
  attrib_type(name) {
    const first_core_geometry = this.core_geometries()[0];
    if (first_core_geometry != null) {
      return first_core_geometry.attrib_type(name);
    } else {
      return null;
    }
  }
  object_attrib_type(name) {
    const first_core_object = this.core_objects()[0];
    if (first_core_object != null) {
      return first_core_object.attrib_type(name);
    } else {
      return null;
    }
  }
  rename_attrib(old_name, new_name, attrib_class) {
    switch (attrib_class) {
      case CoreConstant.ATTRIB_CLASS.VERTEX:
        if (this.has_attrib(old_name)) {
          if (this._objects) {
            for (let object of this._objects) {
              object.traverse((child) => {
                const geometry = CoreGroup.geometry_from_object(child);
                if (geometry) {
                  const core_geometry = new CoreGeometry(geometry);
                  core_geometry.rename_attribute(old_name, new_name);
                }
              });
            }
          }
        }
        break;
      case CoreConstant.ATTRIB_CLASS.OBJECT:
        if (this.has_attrib(old_name)) {
          if (this._objects) {
            for (let object of this._objects) {
              object.traverse((child) => {
                const core_object = new CoreObject(child, 0);
                core_object.rename_attribute(old_name, new_name);
              });
            }
          }
        }
        break;
    }
  }
  attrib_names() {
    let first_geometry;
    if ((first_geometry = this.core_geometries()[0]) != null) {
      return first_geometry.attrib_names();
    } else {
      return [];
    }
  }
  object_attrib_names() {
    let first_object;
    if ((first_object = this.core_objects()[0]) != null) {
      return first_object.attrib_names();
    } else {
      return [];
    }
  }
  attrib_names_matching_mask(masks_string) {
    const masks = CoreString.attrib_names(masks_string);
    const matching_attrib_names = [];
    for (let attrib_name of this.attrib_names()) {
      for (let mask of masks) {
        if (CoreString.match_mask(attrib_name, mask)) {
          matching_attrib_names.push(attrib_name);
        }
      }
    }
    return lodash_uniq(matching_attrib_names);
  }
  attrib_sizes() {
    let first_geometry;
    if ((first_geometry = this.core_geometries()[0]) != null) {
      return first_geometry.attrib_sizes();
    } else {
      return {};
    }
  }
  object_attrib_sizes() {
    let first_object;
    if ((first_object = this.core_objects()[0]) != null) {
      return first_object.attrib_sizes();
    } else {
      return {};
    }
  }
  attrib_size(attrib_name) {
    let first_geometry;
    if ((first_geometry = this.core_geometries()[0]) != null) {
      return first_geometry.attrib_size(attrib_name);
    } else {
      return 0;
    }
  }
  add_numeric_vertex_attrib(name, size, default_value) {
    if (default_value == null) {
      default_value = CoreAttribute.default_value(size);
    }
    for (let core_geometry of this.core_geometries()) {
      core_geometry.add_numeric_attrib(name, size, default_value);
    }
  }
  add_numeric_object_attrib(name, size, default_value) {
    if (default_value == null) {
      default_value = CoreAttribute.default_value(size);
    }
    for (let core_object of this.core_objects()) {
      core_object.add_numeric_attrib(name, default_value);
    }
  }
  static clone(src_group) {
    const new_group = new Group2();
    src_group.children.forEach((src_object) => {
      const new_object = CoreObject.clone(src_object);
      new_group.add(new_object);
    });
    return new_group;
  }
}

import {TypedContainer} from "./_Base";
import {CoreGeometry} from "../../core/geometry/Geometry";
import {CoreObject} from "../../core/geometry/Object";
export class GeometryContainer extends TypedContainer {
  set_objects(objects) {
  }
  core_content_cloned() {
    if (this._content) {
      return this._content.clone();
    }
  }
  set_content(content) {
    super.set_content(content);
  }
  first_object() {
    if (this._content) {
      return this._content.objects()[0];
    }
  }
  first_core_object() {
    const object = this.first_object();
    if (object) {
      return new CoreObject(object, 0);
    }
  }
  first_geometry() {
    const object = this.first_object();
    if (object) {
      return object.geometry;
    } else {
      return null;
    }
  }
  objects_count() {
    if (this._content) {
      return this._content.objects().length;
    } else {
      return 0;
    }
  }
  objects_visible_count() {
    let count = 0;
    if (this._content) {
    }
    return count;
  }
  objects_count_by_type() {
    const count_by_type = {};
    const core_group = this._content;
    if (this._content && core_group) {
      for (let core_object of core_group.core_objects()) {
        const human_type = core_object.human_type();
        if (count_by_type[human_type] == null) {
          count_by_type[human_type] = 0;
        }
        count_by_type[human_type] += 1;
      }
    }
    return count_by_type;
  }
  objects_names_by_type() {
    const names_by_type = {};
    const core_group = this._content;
    if (this._content && core_group) {
      for (let core_object of core_group.core_objects()) {
        const human_type = core_object.human_type();
        names_by_type[human_type] = names_by_type[human_type] || [];
        names_by_type[human_type].push(core_object.name());
      }
    }
    return names_by_type;
  }
  point_attribute_names() {
    let names = [];
    const geometry = this.first_geometry();
    if (geometry) {
      names = Object.keys(geometry.attributes);
    }
    return names;
  }
  point_attribute_sizes_by_name() {
    let sizes_by_name = {};
    const geometry = this.first_geometry();
    if (geometry) {
      Object.keys(geometry.attributes).forEach((attrib_name) => {
        const attrib = geometry.attributes[attrib_name];
        sizes_by_name[attrib_name] = attrib.itemSize;
      });
    }
    return sizes_by_name;
  }
  object_attribute_sizes_by_name() {
    let sizes_by_name = {};
    const core_object = this.first_core_object();
    if (core_object) {
      for (let name of core_object.attrib_names()) {
        const size = core_object.attrib_size(name);
        if (size != null) {
          sizes_by_name[name] = size;
        }
      }
    }
    return sizes_by_name;
  }
  point_attribute_types_by_name() {
    let types_by_name = {};
    const geometry = this.first_geometry();
    if (geometry) {
      const core_geo = new CoreGeometry(geometry);
      Object.keys(geometry.attributes).forEach((attrib_name) => {
        types_by_name[attrib_name] = core_geo.attrib_type(attrib_name);
      });
    }
    return types_by_name;
  }
  object_attribute_types_by_name() {
    let types_by_name = {};
    const core_object = this.first_core_object();
    if (core_object) {
      for (let name of core_object.attrib_names()) {
        types_by_name[name] = core_object.attrib_type(name);
      }
    }
    return types_by_name;
  }
  object_attribute_names() {
    let names = [];
    const object = this.first_object();
    if (object) {
      names = Object.keys(object.userData["attributes"] || {});
    }
    return names;
  }
  points_count() {
    if (this._content) {
      return this._content.points_count();
    } else {
      return 0;
    }
  }
  total_points_count() {
    if (this._content) {
      return this._content.total_points_count();
    } else {
      return 0;
    }
  }
  objects_data() {
    if (this._content) {
      return this._content.objects_data();
    } else {
      return [];
    }
  }
  bounding_box() {
    return this._content.bounding_box();
  }
  center() {
    return this._content.center();
  }
  size() {
    return this._content.size();
  }
}

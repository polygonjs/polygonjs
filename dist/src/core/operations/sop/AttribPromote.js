import {BaseSopOperation} from "./_Base";
import {InputCloneMode as InputCloneMode2} from "../../../engine/poly/InputCloneMode";
import lodash_max from "lodash/max";
import lodash_min from "lodash/min";
import {AttribClass} from "../../geometry/Constant";
import {CoreString} from "../../String";
export var AttribPromoteMode;
(function(AttribPromoteMode2) {
  AttribPromoteMode2[AttribPromoteMode2["MIN"] = 0] = "MIN";
  AttribPromoteMode2[AttribPromoteMode2["MAX"] = 1] = "MAX";
  AttribPromoteMode2[AttribPromoteMode2["FIRST_FOUND"] = 2] = "FIRST_FOUND";
})(AttribPromoteMode || (AttribPromoteMode = {}));
export class AttribPromoteSopOperation extends BaseSopOperation {
  constructor() {
    super(...arguments);
    this._values_per_attrib_name = {};
    this._filtered_values_per_attrib_name = {};
  }
  static type() {
    return "attrib_promote";
  }
  cook(input_contents, params) {
    this._core_group = input_contents[0];
    this._values_per_attrib_name = {};
    this._filtered_values_per_attrib_name = {};
    for (let core_object of this._core_group.core_objects()) {
      this._core_object = core_object;
      this.find_values(params);
      this.filter_values(params);
      this.set_values(params);
    }
    return this._core_group;
  }
  find_values(params) {
    const attrib_names = CoreString.attrib_names(params.name);
    for (let attrib_name of attrib_names) {
      this._find_values_for_attrib_name(attrib_name, params);
    }
  }
  _find_values_for_attrib_name(attrib_name, params) {
    switch (params.class_from) {
      case AttribClass.VERTEX:
        return this.find_values_from_points(attrib_name, params);
      case AttribClass.OBJECT:
        return this.find_values_from_object(attrib_name, params);
    }
  }
  find_values_from_points(attrib_name, params) {
    if (this._core_object) {
      const points = this._core_object.points();
      const first_point = points[0];
      if (first_point) {
        if (!first_point.is_attrib_indexed(attrib_name)) {
          const values = new Array(points.length);
          let point;
          for (let i = 0; i < points.length; i++) {
            point = points[i];
            values[i] = point.attrib_value(attrib_name);
          }
          this._values_per_attrib_name[attrib_name] = values;
        }
      }
    }
  }
  find_values_from_object(attrib_name, params) {
    this._values_per_attrib_name[attrib_name] = [];
    if (this._core_object) {
      this._values_per_attrib_name[attrib_name].push(this._core_object.attrib_value(attrib_name));
    }
  }
  filter_values(params) {
    const attrib_names = Object.keys(this._values_per_attrib_name);
    for (let attrib_name of attrib_names) {
      const values = this._values_per_attrib_name[attrib_name];
      switch (params.mode) {
        case 0:
          this._filtered_values_per_attrib_name[attrib_name] = lodash_min(values);
          break;
        case 1:
          this._filtered_values_per_attrib_name[attrib_name] = lodash_max(values);
          break;
        case 2:
          this._filtered_values_per_attrib_name[attrib_name] = values[0];
          break;
        default:
          break;
      }
    }
  }
  set_values(params) {
    const attrib_names = Object.keys(this._filtered_values_per_attrib_name);
    for (let attrib_name of attrib_names) {
      const new_value = this._filtered_values_per_attrib_name[attrib_name];
      if (new_value != null) {
        switch (params.class_to) {
          case AttribClass.VERTEX:
            this.set_values_to_points(attrib_name, new_value, params);
            break;
          case AttribClass.OBJECT:
            this.set_values_to_object(attrib_name, new_value, params);
            break;
        }
      }
    }
  }
  set_values_to_points(attrib_name, new_value, params) {
    if (this._core_group && this._core_object) {
      const attribute_exists = this._core_group.has_attrib(attrib_name);
      if (!attribute_exists) {
        const param_size = 1;
        this._core_group.add_numeric_vertex_attrib(attrib_name, param_size, new_value);
      }
      const points = this._core_object.points();
      for (let point of points) {
        point.set_attrib_value(attrib_name, new_value);
      }
    }
  }
  set_values_to_object(attrib_name, new_value, params) {
    this._core_object?.set_attrib_value(attrib_name, new_value);
  }
}
AttribPromoteSopOperation.DEFAULT_PARAMS = {
  class_from: AttribClass.VERTEX,
  class_to: AttribClass.OBJECT,
  mode: 2,
  name: ""
};
AttribPromoteSopOperation.INPUT_CLONED_STATE = InputCloneMode2.FROM_NODE;

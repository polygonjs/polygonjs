import {TypedSopNode} from "./_Base";
import {
  AttribSize,
  ATTRIBUTE_TYPES,
  AttribType,
  AttribTypeMenuEntries,
  object_type_from_constructor
} from "../../../core/geometry/Constant";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {CoreObject} from "../../../core/geometry/Object";
import {CoreGeometry} from "../../../core/geometry/Geometry";
import {MapUtils as MapUtils2} from "../../../core/MapUtils";
class DeleteSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.attrib_type = ParamConfig.INTEGER(ATTRIBUTE_TYPES.indexOf(AttribType.NUMERIC), {
      menu: {
        entries: AttribTypeMenuEntries
      }
    });
    this.attrib_name = ParamConfig.STRING("");
  }
}
const ParamsConfig2 = new DeleteSopParamsConfig();
export class SplitSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this._new_objects = [];
  }
  static type() {
    return "split";
  }
  static displayed_input_names() {
    return ["geometry to split in multiple objects"];
  }
  initialize_node() {
    this.io.inputs.set_count(1);
  }
  async cook(input_contents) {
    const core_group = input_contents[0];
    this._new_objects = [];
    if (this.pv.attrib_name != "") {
      this._split_core_group(core_group);
    }
    this.set_objects(this._new_objects);
  }
  async _split_core_group(core_group) {
    const core_objects = core_group.core_objects();
    for (let core_object of core_objects) {
      this._split_core_object(core_object);
    }
  }
  _split_core_object(core_object) {
    let core_geometry = core_object.core_geometry();
    let attrib_name = this.pv.attrib_name;
    let points_by_value = new Map();
    if (core_geometry) {
      const object = core_object.object();
      const points = core_geometry.points_from_geometry();
      const first_point = points[0];
      if (first_point) {
        const attrib_size = first_point.attrib_size(attrib_name);
        if (!(attrib_size == AttribSize.FLOAT || first_point.is_attrib_indexed(attrib_name))) {
          this.states.error.set(`attrib '${attrib_name}' must be a float or a string`);
          return;
        }
        let val;
        if (first_point.is_attrib_indexed(attrib_name)) {
          for (let point of points) {
            val = point.indexed_attrib_value(attrib_name);
            MapUtils2.push_on_array_at_entry(points_by_value, val, point);
          }
        } else {
          for (let point of points) {
            val = point.attrib_value(attrib_name);
            MapUtils2.push_on_array_at_entry(points_by_value, val, point);
          }
        }
      }
      const object_type = object_type_from_constructor(object.constructor);
      points_by_value.forEach((points2, value) => {
        const new_geometry = CoreGeometry.geometry_from_points(points2, object_type);
        if (new_geometry) {
          const object2 = this.create_object(new_geometry, object_type);
          CoreObject.add_attribute(object2, attrib_name, value);
          this._new_objects.push(object2);
        }
      });
    }
  }
}

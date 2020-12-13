import {TypedSopNode} from "./_Base";
import {InputCloneMode as InputCloneMode2} from "../../poly/InputCloneMode";
const POSITION_ATTRIB_NAME = "position";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class PointSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.update_x = ParamConfig.BOOLEAN(0);
    this.x = ParamConfig.FLOAT("@P.x", {
      visible_if: {update_x: 1},
      expression: {for_entities: true}
    });
    this.update_y = ParamConfig.BOOLEAN(0);
    this.y = ParamConfig.FLOAT("@P.y", {
      visible_if: {update_y: 1},
      expression: {for_entities: true}
    });
    this.update_z = ParamConfig.BOOLEAN(0);
    this.z = ParamConfig.FLOAT("@P.z", {
      visible_if: {update_z: 1},
      expression: {for_entities: true}
    });
    this.update_normals = ParamConfig.BOOLEAN(1);
  }
}
const ParamsConfig2 = new PointSopParamsConfig();
export class PointSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this._x_arrays_by_geometry_uuid = new Map();
    this._y_arrays_by_geometry_uuid = new Map();
    this._z_arrays_by_geometry_uuid = new Map();
  }
  static type() {
    return "point";
  }
  static displayed_input_names() {
    return ["points to move"];
  }
  initialize_node() {
    this.io.inputs.set_count(1);
    this.io.inputs.init_inputs_cloned_state(InputCloneMode2.FROM_NODE);
  }
  async cook(input_contents) {
    const core_group = input_contents[0];
    await this._eval_expressions_for_core_group(core_group);
  }
  async _eval_expressions_for_core_group(core_group) {
    const core_objects = core_group.core_objects();
    for (let i = 0; i < core_objects.length; i++) {
      await this._eval_expressions_for_core_object(core_objects[i]);
    }
    if (this.pv.update_normals) {
      core_group.compute_vertex_normals();
    }
    const geometries = core_group.geometries();
    for (let geometry of geometries) {
      geometry.computeBoundingBox();
    }
    if (!this.io.inputs.clone_required(0)) {
      const geometries2 = core_group.geometries();
      for (let geometry of geometries2) {
        const attrib = geometry.getAttribute(POSITION_ATTRIB_NAME);
        attrib.needsUpdate = true;
      }
    }
    this.set_core_group(core_group);
  }
  async _eval_expressions_for_core_object(core_object) {
    const object = core_object.object();
    const geometry = object.geometry;
    const points = core_object.points();
    const array = geometry.getAttribute(POSITION_ATTRIB_NAME).array;
    const tmp_array_x = await this._update_from_param(geometry, array, points, this.p.update_x, this.p.x, this.pv.x, this._x_arrays_by_geometry_uuid, 0);
    const tmp_array_y = await this._update_from_param(geometry, array, points, this.p.update_y, this.p.y, this.pv.y, this._y_arrays_by_geometry_uuid, 1);
    const tmp_array_z = await this._update_from_param(geometry, array, points, this.p.update_z, this.p.z, this.pv.z, this._z_arrays_by_geometry_uuid, 2);
    if (tmp_array_x) {
      this._commit_tmp_values(tmp_array_x, array, 0);
    }
    if (tmp_array_y) {
      this._commit_tmp_values(tmp_array_y, array, 1);
    }
    if (tmp_array_z) {
      this._commit_tmp_values(tmp_array_z, array, 2);
    }
  }
  async _update_from_param(geometry, array, points, do_update_param, value_param, param_value, arrays_by_geometry_uuid, offset) {
    const do_update = do_update_param;
    const param = value_param;
    let tmp_array = this._init_array_if_required(geometry, arrays_by_geometry_uuid, points.length, offset);
    if (do_update.value) {
      if (param.has_expression() && param.expression_controller) {
        await param.expression_controller.compute_expression_for_points(points, (point, value) => {
          tmp_array[point.index] = value;
        });
      } else {
        let point;
        for (let i = 0; i < points.length; i++) {
          point = points[i];
          tmp_array[point.index] = param_value;
        }
      }
    }
    return tmp_array;
  }
  _init_array_if_required(geometry, arrays_by_geometry_uuid, points_count, offset) {
    const uuid = geometry.uuid;
    const current_array = arrays_by_geometry_uuid.get(uuid);
    if (current_array) {
      if (current_array.length < points_count) {
        const new_array = this._array_for_component(geometry, points_count, offset);
        arrays_by_geometry_uuid.set(uuid, new_array);
        return new_array;
      } else {
        return current_array;
      }
    } else {
      const new_array = this._array_for_component(geometry, points_count, offset);
      arrays_by_geometry_uuid.set(uuid, new_array);
      return new_array;
    }
  }
  _array_for_component(geometry, points_count, offset) {
    const new_array = new Array(points_count);
    const src_array = geometry.getAttribute(POSITION_ATTRIB_NAME).array;
    for (let i = 0; i < new_array.length; i++) {
      new_array[i] = src_array[i * 3 + offset];
    }
    return new_array;
  }
  _commit_tmp_values(tmp_array, target_array, offset) {
    for (let i = 0; i < tmp_array.length; i++) {
      target_array[i * 3 + offset] = tmp_array[i];
    }
  }
}

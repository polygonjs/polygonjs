import {Color as Color2} from "three/src/math/Color";
import {CoreColor} from "../../../core/Color";
import {TypedSopNode} from "./_Base";
import {InputCloneMode as InputCloneMode2} from "../../poly/InputCloneMode";
const DEFAULT_COLOR = new Color2(1, 1, 1);
const COLOR_ATTRIB_NAME = "color";
import {ColorSopOperation} from "../../../core/operations/sop/Color";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
const DEFAULT = ColorSopOperation.DEFAULT_PARAMS;
class ColorSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.from_attribute = ParamConfig.BOOLEAN(DEFAULT.from_attribute);
    this.attrib_name = ParamConfig.STRING(DEFAULT.attrib_name, {
      visible_if: {from_attribute: 1}
    });
    this.color = ParamConfig.COLOR(DEFAULT.color, {
      visible_if: {from_attribute: 0},
      expression: {for_entities: true}
    });
    this.as_hsv = ParamConfig.BOOLEAN(DEFAULT.as_hsv, {
      visible_if: {from_attribute: 0}
    });
  }
}
const ParamsConfig2 = new ColorSopParamsConfig();
export class ColorSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this._r_arrays_by_geometry_uuid = {};
    this._g_arrays_by_geometry_uuid = {};
    this._b_arrays_by_geometry_uuid = {};
  }
  static type() {
    return "color";
  }
  static displayed_input_names() {
    return ["geometry to update color of"];
  }
  initialize_node() {
    this.io.inputs.set_count(1);
    this.io.inputs.init_inputs_cloned_state(InputCloneMode2.FROM_NODE);
  }
  async cook(input_contents) {
    const core_group = input_contents[0];
    const core_objects = core_group.core_objects();
    for (let core_object of core_objects) {
      if (this.pv.from_attribute) {
        this._set_from_attribute(core_object);
      } else {
        const has_expression = this.p.color.has_expression();
        if (has_expression) {
          await this._eval_expressions(core_object);
        } else {
          this._eval_simple_values(core_object);
        }
      }
    }
    if (!this.io.inputs.clone_required(0)) {
      const geometries = core_group.geometries();
      for (let geometry of geometries) {
        geometry.getAttribute(COLOR_ATTRIB_NAME).needsUpdate = true;
      }
    }
    this.set_core_group(core_group);
  }
  _set_from_attribute(core_object) {
    const core_geometry = core_object.core_geometry();
    if (!core_geometry) {
      return;
    }
    this._create_init_color(core_geometry, DEFAULT_COLOR);
    const points = core_geometry.points();
    const src_attrib_size = core_geometry.attrib_size(this.pv.attrib_name);
    const geometry = core_geometry.geometry();
    const src_array = geometry.getAttribute(this.pv.attrib_name).array;
    const dest_array = geometry.getAttribute(COLOR_ATTRIB_NAME).array;
    switch (src_attrib_size) {
      case 1: {
        for (let i = 0; i < points.length; i++) {
          const dest_i = i * 3;
          dest_array[dest_i + 0] = src_array[i];
          dest_array[dest_i + 1] = 1 - src_array[i];
          dest_array[dest_i + 2] = 0;
        }
        break;
      }
      case 2: {
        for (let i = 0; i < points.length; i++) {
          const dest_i = i * 3;
          const src_i = i * 2;
          dest_array[dest_i + 0] = src_array[src_i + 0];
          dest_array[dest_i + 1] = src_array[src_i + 1];
          dest_array[dest_i + 2] = 0;
        }
        break;
      }
      case 3: {
        for (let i = 0; i < src_array.length; i++) {
          dest_array[i] = src_array[i];
        }
        break;
      }
      case 4: {
        for (let i = 0; i < points.length; i++) {
          const dest_i = i * 3;
          const src_i = i * 4;
          dest_array[dest_i + 0] = src_array[src_i + 0];
          dest_array[dest_i + 1] = src_array[src_i + 1];
          dest_array[dest_i + 2] = src_array[src_i + 2];
        }
        break;
      }
    }
  }
  _create_init_color(core_geometry, color) {
    if (!core_geometry.has_attrib(COLOR_ATTRIB_NAME)) {
      core_geometry.add_numeric_attrib(COLOR_ATTRIB_NAME, 3, DEFAULT_COLOR);
    }
  }
  _eval_simple_values(core_object) {
    const core_geometry = core_object.core_geometry();
    if (!core_geometry) {
      return;
    }
    this._create_init_color(core_geometry, DEFAULT_COLOR);
    let new_color;
    if (this.pv.as_hsv) {
      new_color = new Color2();
      CoreColor.set_hsv(this.pv.color.r, this.pv.color.g, this.pv.color.b, new_color);
    } else {
      new_color = this.pv.color;
    }
    core_geometry.add_numeric_attrib(COLOR_ATTRIB_NAME, 3, new_color);
  }
  async _eval_expressions(core_object) {
    const points = core_object.points();
    const object = core_object.object();
    const core_geometry = core_object.core_geometry();
    if (core_geometry) {
      this._create_init_color(core_geometry, DEFAULT_COLOR);
    }
    const geometry = object.geometry;
    if (geometry) {
      const array = geometry.getAttribute(COLOR_ATTRIB_NAME).array;
      const tmp_array_r = await this._update_from_param(geometry, array, points, 0);
      const tmp_array_g = await this._update_from_param(geometry, array, points, 1);
      const tmp_array_b = await this._update_from_param(geometry, array, points, 2);
      if (tmp_array_r) {
        this._commit_tmp_values(tmp_array_r, array, 0);
      }
      if (tmp_array_g) {
        this._commit_tmp_values(tmp_array_g, array, 1);
      }
      if (tmp_array_b) {
        this._commit_tmp_values(tmp_array_b, array, 2);
      }
      if (this.pv.as_hsv) {
        let current = new Color2();
        let target = new Color2();
        let index;
        for (let point of points) {
          index = point.index * 3;
          current.fromArray(array, index);
          CoreColor.set_hsv(current.r, current.g, current.b, target);
          target.toArray(array, index);
        }
      }
    }
  }
  async _update_from_param(geometry, array, points, offset) {
    const param = this.p.color.components[offset];
    const param_value = [this.pv.color.r, this.pv.color.g, this.pv.color.b][offset];
    const arrays_by_geometry_uuid = [
      this._r_arrays_by_geometry_uuid,
      this._g_arrays_by_geometry_uuid,
      this._b_arrays_by_geometry_uuid
    ][offset];
    let tmp_array;
    if (param.has_expression() && param.expression_controller) {
      tmp_array = this._init_array_if_required(geometry, arrays_by_geometry_uuid, points.length);
      await param.expression_controller.compute_expression_for_points(points, (point, value) => {
        tmp_array[point.index] = value;
      });
    } else {
      for (let point of points) {
        array[point.index * 3 + offset] = param_value;
      }
    }
    return tmp_array;
  }
  _init_array_if_required(geometry, arrays_by_geometry_uuid, points_count) {
    const uuid = geometry.uuid;
    const current_array = arrays_by_geometry_uuid[uuid];
    if (current_array) {
      if (current_array.length < points_count) {
        arrays_by_geometry_uuid[uuid] = new Array(points_count);
      }
    } else {
      arrays_by_geometry_uuid[uuid] = new Array(points_count);
    }
    return arrays_by_geometry_uuid[uuid];
  }
  _commit_tmp_values(tmp_array, target_array, offset) {
    for (let i = 0; i < tmp_array.length; i++) {
      target_array[i * 3 + offset] = tmp_array[i];
    }
  }
}

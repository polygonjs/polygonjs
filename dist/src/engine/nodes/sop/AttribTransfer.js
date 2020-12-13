import {TypedSopNode} from "./_Base";
import {CoreInterpolate} from "../../../core/math/Interpolate";
import {CoreOctree} from "../../../core/math/octree/Octree";
import {CoreIterator} from "../../../core/Iterator";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {InputCloneMode as InputCloneMode2} from "../../poly/InputCloneMode";
class AttribTransferSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.src_group = ParamConfig.STRING();
    this.dest_group = ParamConfig.STRING();
    this.name = ParamConfig.STRING();
    this.max_samples_count = ParamConfig.INTEGER(1, {
      range: [1, 10],
      range_locked: [true, false]
    });
    this.distance_threshold = ParamConfig.FLOAT(1);
    this.blend_width = ParamConfig.FLOAT(0);
  }
}
const ParamsConfig2 = new AttribTransferSopParamsConfig();
export class AttribTransferSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "attrib_transfer";
  }
  static displayed_input_names() {
    return ["geometry to transfer attributes to", "geometry to transfer attributes from"];
  }
  initialize_node() {
    this.io.inputs.set_count(2);
    this.io.inputs.init_inputs_cloned_state([InputCloneMode2.FROM_NODE, InputCloneMode2.NEVER]);
  }
  async cook(input_contents) {
    this._core_group_dest = input_contents[0];
    const dest_points = this._core_group_dest.points_from_group(this.pv.dest_group);
    this._core_group_src = input_contents[1];
    this._attrib_names = this._core_group_src.attrib_names_matching_mask(this.pv.name);
    this._error_if_attribute_not_found_on_second_input();
    this._build_octree_if_required(this._core_group_src);
    this._add_attribute_if_required();
    await this._transfer_attributes(dest_points);
    this.set_core_group(this._core_group_dest);
  }
  _error_if_attribute_not_found_on_second_input() {
    for (let attrib_name of this._attrib_names) {
      if (!this._core_group_src.has_attrib(attrib_name)) {
        this.states.error.set(`attribute '${attrib_name}' not found on second input`);
      }
    }
  }
  _build_octree_if_required(core_group) {
    const second_input_changed = this._octree_timestamp == null || this._octree_timestamp !== core_group.timestamp();
    const src_group_changed = this._prev_param_src_group !== this.pv.src_group;
    if (src_group_changed || second_input_changed) {
      this._octree_timestamp = core_group.timestamp();
      this._prev_param_src_group = this.pv.src_group;
      const points_src = this._core_group_src.points_from_group(this.pv.src_group);
      this._octree = new CoreOctree(this._core_group_src.bounding_box());
      this._octree.set_points(points_src);
    }
  }
  _add_attribute_if_required() {
    this._attrib_names.forEach((attrib_name) => {
      if (!this._core_group_dest.has_attrib(attrib_name)) {
        const attrib_size = this._core_group_src.attrib_size(attrib_name);
        this._core_group_dest.add_numeric_vertex_attrib(attrib_name, attrib_size, 0);
      }
    });
  }
  async _transfer_attributes(dest_points) {
    const iterator = new CoreIterator();
    await iterator.start_with_array(dest_points, this._transfer_attributes_for_point.bind(this));
  }
  _transfer_attributes_for_point(dest_point) {
    const total_dist = this.pv.distance_threshold + this.pv.blend_width;
    const nearest_points = this._octree?.find_points(dest_point.position(), total_dist, this.pv.max_samples_count) || [];
    for (let attrib_name of this._attrib_names) {
      this._interpolate_points(dest_point, nearest_points, attrib_name);
    }
  }
  _interpolate_points(point_dest, src_points, attrib_name) {
    let new_value;
    new_value = CoreInterpolate.perform(point_dest, src_points, attrib_name, this.pv.distance_threshold, this.pv.blend_width);
    if (new_value != null) {
      point_dest.set_attrib_value(attrib_name, new_value);
    }
  }
}

import {Vector2 as Vector22} from "three/src/math/Vector2";
import {Vector3 as Vector32} from "three/src/math/Vector3";
import {Vector4 as Vector42} from "three/src/math/Vector4";
import {TypedSopNode} from "./_Base";
import {AttribSize} from "../../../core/geometry/Constant";
import {TypeAssert} from "../../poly/Assert";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class AttribRemapSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.name = ParamConfig.STRING();
    this.ramp = ParamConfig.RAMP();
    this.change_name = ParamConfig.BOOLEAN(0);
    this.new_name = ParamConfig.STRING("", {visible_if: {change_name: 1}});
  }
}
const ParamsConfig2 = new AttribRemapSopParamsConfig();
export class AttribRemapSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "attrib_remap";
  }
  initialize_node() {
    this.io.inputs.set_count(1);
  }
  cook(input_contents) {
    const core_group = input_contents[0];
    this._remap_attribute(core_group);
    this.set_core_group(core_group);
  }
  _remap_attribute(core_group) {
    const points = core_group.points();
    if (points.length === 0) {
      return;
    }
    if (this.pv.name === "") {
      return;
    }
    const attrib_size = points[0].attrib_size(this.pv.name);
    const values = points.map((point) => point.attrib_value(this.pv.name));
    let remaped_values = new Array(points.length);
    this._get_remaped_values(attrib_size, values, remaped_values);
    let target_name = this.pv.name;
    if (this.pv.change_name) {
      target_name = this.pv.new_name;
      if (!core_group.has_attrib(target_name)) {
        core_group.add_numeric_vertex_attrib(target_name, attrib_size, 0);
      }
    }
    let i = 0;
    for (let normalized_value of remaped_values) {
      const point = points[i];
      point.set_attrib_value(target_name, normalized_value);
      i++;
    }
  }
  _get_remaped_values(attrib_size, values, remaped_values) {
    switch (attrib_size) {
      case AttribSize.FLOAT:
        return this._get_normalized_float(values, remaped_values);
      case AttribSize.VECTOR2:
        return this._get_normalized_vector2(values, remaped_values);
      case AttribSize.VECTOR3:
        return this._get_normalized_vector3(values, remaped_values);
      case AttribSize.VECTOR4:
        return this._get_normalized_vector4(values, remaped_values);
    }
    TypeAssert.unreachable(attrib_size);
  }
  _get_normalized_float(values, remaped_values) {
    const valuesf = values;
    const ramp_param = this.p.ramp;
    for (let i = 0; i < valuesf.length; i++) {
      const value = valuesf[i];
      const remaped_value = ramp_param.value_at_position(value);
      remaped_values[i] = remaped_value;
    }
  }
  _get_normalized_vector2(values, remaped_values) {
    const valuesv = values;
    const ramp_param = this.p.ramp;
    for (let i = 0; i < valuesv.length; i++) {
      const value = valuesv[i];
      const remaped_value = new Vector22(ramp_param.value_at_position(value.x), ramp_param.value_at_position(value.y));
      remaped_values[i] = remaped_value;
    }
  }
  _get_normalized_vector3(values, remaped_values) {
    const valuesv = values;
    const ramp_param = this.p.ramp;
    for (let i = 0; i < valuesv.length; i++) {
      const value = valuesv[i];
      const remaped_value = new Vector32(ramp_param.value_at_position(value.x), ramp_param.value_at_position(value.y), ramp_param.value_at_position(value.z));
      remaped_values[i] = remaped_value;
    }
  }
  _get_normalized_vector4(values, remaped_values) {
    const valuesv = values;
    const ramp_param = this.p.ramp;
    for (let i = 0; i < valuesv.length; i++) {
      const value = valuesv[i];
      const remaped_value = new Vector42(ramp_param.value_at_position(value.x), ramp_param.value_at_position(value.y), ramp_param.value_at_position(value.z), ramp_param.value_at_position(value.w));
      remaped_values[i] = remaped_value;
    }
  }
}

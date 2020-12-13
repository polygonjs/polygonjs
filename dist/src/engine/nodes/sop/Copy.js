import lodash_compact from "lodash/compact";
import {TypedSopNode} from "./_Base";
import {CoreObject} from "../../../core/geometry/Object";
import {CoreInstancer} from "../../../core/geometry/Instancer";
import {CoreString} from "../../../core/String";
import {CopyStamp as CopyStamp2} from "./utils/CopyStamp";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {InputCloneMode as InputCloneMode2} from "../../poly/InputCloneMode";
import {Vector3 as Vector32} from "three/src/math/Vector3";
import {Quaternion as Quaternion2} from "three/src/math/Quaternion";
class CopySopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.count = ParamConfig.INTEGER(1, {
      range: [1, 20],
      range_locked: [true, false]
    });
    this.transform_only = ParamConfig.BOOLEAN(0);
    this.copy_attributes = ParamConfig.BOOLEAN(0);
    this.attributes_to_copy = ParamConfig.STRING("", {
      visible_if: {copy_attributes: true}
    });
    this.use_copy_expr = ParamConfig.BOOLEAN(0);
  }
}
const ParamsConfig2 = new CopySopParamsConfig();
export class CopySopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this._attribute_names_to_copy = [];
    this._objects = [];
  }
  static type() {
    return "copy";
  }
  static displayed_input_names() {
    return ["geometry to be copied", "points to copy to"];
  }
  initialize_node() {
    this.io.inputs.set_count(1, 2);
    this.io.inputs.init_inputs_cloned_state([InputCloneMode2.ALWAYS, InputCloneMode2.NEVER]);
  }
  async cook(input_contents) {
    const core_group0 = input_contents[0];
    if (!this.io.inputs.has_input(1)) {
      await this.cook_without_template(core_group0);
      return;
    }
    const core_group1 = input_contents[1];
    if (!core_group1) {
      this.states.error.set("second input invalid");
      return;
    }
    await this.cook_with_template(core_group0, core_group1);
  }
  async cook_with_template(instance_core_group, template_core_group) {
    this._objects = [];
    const template_points = template_core_group.points();
    const instancer = new CoreInstancer(template_core_group);
    let instance_matrices = instancer.matrices();
    const t = new Vector32();
    const q = new Quaternion2();
    const s = new Vector32();
    instance_matrices[0].decompose(t, q, s);
    this._attribute_names_to_copy = CoreString.attrib_names(this.pv.attributes_to_copy).filter((attrib_name) => template_core_group.has_attrib(attrib_name));
    await this._copy_moved_objects_on_template_points(instance_core_group, instance_matrices, template_points);
    this.set_objects(this._objects);
  }
  async _copy_moved_objects_on_template_points(instance_core_group, instance_matrices, template_points) {
    for (let point_index = 0; point_index < template_points.length; point_index++) {
      await this._copy_moved_object_on_template_point(instance_core_group, instance_matrices, template_points, point_index);
    }
  }
  async _copy_moved_object_on_template_point(instance_core_group, instance_matrices, template_points, point_index) {
    const matrix = instance_matrices[point_index];
    const template_point = template_points[point_index];
    this.stamp_node.set_point(template_point);
    const moved_objects = await this._get_moved_objects_for_template_point(instance_core_group, point_index);
    for (let moved_object of moved_objects) {
      if (this.pv.copy_attributes) {
        this._copy_attributes_from_template(moved_object, template_point);
      }
      if (this.pv.transform_only) {
        moved_object.applyMatrix4(matrix);
      } else {
        const geometry = moved_object.geometry;
        if (geometry) {
          moved_object.geometry.applyMatrix4(matrix);
        }
      }
      this._objects.push(moved_object);
    }
  }
  async _get_moved_objects_for_template_point(instance_core_group, point_index) {
    const stamped_instance_core_group = await this._stamp_instance_group_if_required(instance_core_group);
    if (stamped_instance_core_group) {
      const moved_objects = this.pv.transform_only ? lodash_compact([stamped_instance_core_group.objects_with_geo()[point_index]]) : stamped_instance_core_group.clone().objects_with_geo();
      return moved_objects;
    } else {
      return [];
    }
  }
  async _stamp_instance_group_if_required(instance_core_group) {
    if (this.pv.use_copy_expr) {
      const container0 = await this.container_controller.request_input_container(0);
      if (container0) {
        const core_group0 = container0.core_content();
        if (core_group0) {
          return core_group0;
        } else {
          return;
        }
      } else {
        this.states.error.set(`input failed for index ${this.stamp_value()}`);
        return;
      }
    } else {
      return instance_core_group;
    }
  }
  async _copy_moved_objects_for_each_instance(instance_core_group) {
    for (let i = 0; i < this.pv.count; i++) {
      await this._copy_moved_objects_for_instance(instance_core_group, i);
    }
  }
  async _copy_moved_objects_for_instance(instance_core_group, i) {
    this.stamp_node.set_global_index(i);
    const stamped_instance_core_group = await this._stamp_instance_group_if_required(instance_core_group);
    if (stamped_instance_core_group) {
      stamped_instance_core_group.objects().forEach((object) => {
        const new_object = CoreObject.clone(object);
        this._objects.push(new_object);
      });
    }
  }
  async cook_without_template(instance_core_group) {
    this._objects = [];
    await this._copy_moved_objects_for_each_instance(instance_core_group);
    this.set_objects(this._objects);
  }
  _copy_attributes_from_template(object, template_point) {
    this._attribute_names_to_copy.forEach((attrib_name, i) => {
      const attrib_value = template_point.attrib_value(attrib_name);
      const object_wrapper = new CoreObject(object, i);
      object_wrapper.add_attribute(attrib_name, attrib_value);
    });
  }
  stamp_value(attrib_name) {
    return this.stamp_node.value(attrib_name);
  }
  get stamp_node() {
    return this._stamp_node = this._stamp_node || this.create_stamp_node();
  }
  create_stamp_node() {
    const stamp_node = new CopyStamp2(this.scene);
    this.dirty_controller.set_forbidden_trigger_nodes([stamp_node]);
    return stamp_node;
  }
}

import {TypedSopNode} from "./_Base";
import {InputCloneMode as InputCloneMode2} from "../../poly/InputCloneMode";
import {Attribute as Attribute2} from "../../../core/geometry/Attribute";
import {CoreGeometry} from "../../../core/geometry/Geometry";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class NormalsSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.edit = ParamConfig.BOOLEAN(0);
    this.update_x = ParamConfig.BOOLEAN(0, {
      visible_if: {edit: 1}
    });
    this.x = ParamConfig.FLOAT("@N.x", {
      visible_if: {update_x: 1, edit: 1},
      expression: {for_entities: true}
    });
    this.update_y = ParamConfig.BOOLEAN(0, {
      visible_if: {edit: 1}
    });
    this.y = ParamConfig.FLOAT("@N.y", {
      visible_if: {update_y: 1, edit: 1},
      expression: {for_entities: true}
    });
    this.update_z = ParamConfig.BOOLEAN(0, {
      visible_if: {edit: 1}
    });
    this.z = ParamConfig.FLOAT("@N.z", {
      visible_if: {update_z: 1, edit: 1},
      expression: {for_entities: true}
    });
    this.recompute = ParamConfig.BOOLEAN(1, {
      visible_if: {edit: 0}
    });
    this.invert = ParamConfig.BOOLEAN(0);
  }
}
const ParamsConfig2 = new NormalsSopParamsConfig();
export class NormalsSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "normals";
  }
  static displayed_input_names() {
    return ["geometry to update normals of"];
  }
  initialize_node() {
    this.io.inputs.set_count(1);
    this.io.inputs.init_inputs_cloned_state(InputCloneMode2.FROM_NODE);
  }
  async cook(input_contents) {
    const core_group = input_contents[0];
    if (this.pv.edit) {
      await this._eval_expressions_for_core_group(core_group);
    } else {
      if (this.pv.recompute) {
        core_group.compute_vertex_normals();
      }
    }
    if (this.pv.invert) {
      this._invert_normals(core_group);
    }
    this.set_core_group(core_group);
  }
  async _eval_expressions_for_core_group(core_group) {
    const core_objects = core_group.core_objects();
    for (let i = 0; i < core_objects.length; i++) {
      await this._eval_expressions_for_core_object(core_objects[i]);
    }
  }
  async _eval_expressions_for_core_object(core_object) {
    const object = core_object.object();
    const geometry = object.geometry;
    const points = core_object.points();
    let attrib = geometry.getAttribute(Attribute2.NORMAL);
    if (!attrib) {
      const core_geometry = new CoreGeometry(geometry);
      core_geometry.add_numeric_attrib(Attribute2.NORMAL, 3, 0);
      attrib = geometry.getAttribute(Attribute2.NORMAL);
    }
    const array = attrib.array;
    if (this.pv.update_x) {
      if (this.p.x.has_expression() && this.p.x.expression_controller) {
        await this.p.x.expression_controller.compute_expression_for_points(points, (point, value) => {
          array[point.index * 3 + 0] = value;
        });
      } else {
        let point;
        for (let i = 0; i < points.length; i++) {
          point = points[i];
          array[point.index * 3 + 0] = this.pv.x;
        }
      }
    }
    if (this.pv.update_y) {
      if (this.p.y.has_expression() && this.p.y.expression_controller) {
        await this.p.y.expression_controller.compute_expression_for_points(points, (point, value) => {
          array[point.index * 3 + 1] = value;
        });
      } else {
        let point;
        for (let i = 0; i < points.length; i++) {
          point = points[i];
          array[point.index * 3 + 1] = this.pv.y;
        }
      }
    }
    if (this.pv.update_z) {
      if (this.p.z.has_expression() && this.p.z.expression_controller) {
        await this.p.z.expression_controller.compute_expression_for_points(points, (point, value) => {
          array[point.index * 3 + 2] = value;
        });
      } else {
        let point;
        for (let i = 0; i < points.length; i++) {
          point = points[i];
          array[point.index * 3 + 2] = this.pv.z;
        }
      }
    }
  }
  _invert_normals(core_group) {
    for (let core_object of core_group.core_objects()) {
      const geometry = core_object.core_geometry()?.geometry();
      if (geometry) {
        const normal_attrib = geometry.attributes[Attribute2.NORMAL];
        if (normal_attrib) {
          const array = normal_attrib.array;
          for (let i = 0; i < array.length; i++) {
            array[i] *= -1;
          }
        }
      }
    }
  }
}

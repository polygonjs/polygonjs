import {TypedSopNode} from "./_Base";
import {CameraController as CameraController2} from "../../../core/CameraController";
const UV_NAME = "uv";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {InputCloneMode as InputCloneMode2} from "../../poly/InputCloneMode";
import {NodeContext as NodeContext2} from "../../poly/NodeContext";
class UvProjectSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.camera = ParamConfig.OPERATOR_PATH("/perspective_camera1", {
      node_selection: {
        context: NodeContext2.OBJ
      }
    });
  }
}
const ParamsConfig2 = new UvProjectSopParamsConfig();
export class UvProjectSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this._camera_controller = new CameraController2(this._update_uvs_from_camera.bind(this));
  }
  static type() {
    return "uv_project";
  }
  initialize_node() {
    this.io.inputs.set_count(1);
    this.io.inputs.init_inputs_cloned_state(InputCloneMode2.FROM_NODE);
  }
  cook(core_groups) {
    this._processed_core_group = core_groups[0];
    const camera_node = this.p.camera.found_node();
    if (camera_node != null) {
      this._camera_object = camera_node.object;
      this._camera_controller.set_target(this._camera_object);
    } else {
      this._camera_object = void 0;
      this._camera_controller.remove_target();
    }
    this.set_core_group(this._processed_core_group);
  }
  _update_uvs_from_camera(look_at_target) {
    if (this._processed_core_group && this.parent) {
      const points = this._processed_core_group.points();
      const obj_world_matrix = this.parent.object.matrixWorld;
      points.forEach((point) => {
        const position = point.position();
        const uvw = this._vector_in_camera_space(position, obj_world_matrix);
        if (uvw) {
          const uv = {
            x: 1 - (uvw[0] * 0.5 + 0.5),
            y: uvw[1] * 0.5 + 0.5
          };
          point.set_attrib_value(UV_NAME, uv);
        }
      });
    }
  }
  _vector_in_camera_space(vector, obj_world_matrix) {
    if (this._camera_object) {
      vector.applyMatrix4(obj_world_matrix);
      return vector.project(this._camera_object).toArray();
    }
  }
}

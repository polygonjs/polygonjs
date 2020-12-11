import {TypedSopNode} from "./_Base";
import {LOD as LOD2} from "three/src/objects/LOD";
import {InputCloneMode as InputCloneMode2} from "../../poly/InputCloneMode";
import {CameraNodeType, NodeContext as NodeContext2} from "../../poly/NodeContext";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {CoreTransform} from "../../../core/Transform";
class LODSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.distance0 = ParamConfig.FLOAT(1);
    this.distance1 = ParamConfig.FLOAT(2);
    this.auto_update = ParamConfig.BOOLEAN(1);
    this.update = ParamConfig.BUTTON(null, {
      callback: (node) => {
        LODSopNode.PARAM_CALLBACK_update(node);
      }
    });
    this.camera = ParamConfig.OPERATOR_PATH("/perspective_camera1", {
      visible_if: {auto_update: 0},
      dependent_on_found_node: false
    });
  }
}
const ParamsConfig2 = new LODSopParamsConfig();
export class LODSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this._lod = this._create_LOD();
  }
  static type() {
    return "lod";
  }
  static displayed_input_names() {
    return ["high res", "mid res", "low res"];
  }
  initialize_node() {
    this.io.inputs.set_count(1, 3);
    this.io.inputs.init_inputs_cloned_state(InputCloneMode2.FROM_NODE);
  }
  _create_LOD() {
    const lod = new LOD2();
    lod.matrixAutoUpdate = false;
    return lod;
  }
  cook(input_contents) {
    this._clear_lod();
    this._add_level(input_contents[0], 0);
    this._add_level(input_contents[1], this.pv.distance0);
    this._add_level(input_contents[2], this.pv.distance1);
    this._lod.autoUpdate = this.pv.auto_update;
    this.set_object(this._lod);
  }
  _add_level(core_group, level) {
    if (core_group) {
      const objects = core_group.objects();
      let object;
      for (let i = 0; i < objects.length; i++) {
        object = objects[i];
        object.visible = true;
        this._lod.addLevel(object, level);
        if (level == 0) {
          if (i == 0) {
            this._lod.matrix.copy(object.matrix);
            CoreTransform.decompose_matrix(this._lod);
          }
        }
        object.matrix.identity();
        CoreTransform.decompose_matrix(object);
      }
    }
  }
  _clear_lod() {
    let child;
    while (child = this._lod.children[0]) {
      this._lod.remove(child);
      child.matrix.multiply(this._lod.matrix);
      CoreTransform.decompose_matrix(child);
    }
    while (this._lod.levels.pop()) {
    }
  }
  static PARAM_CALLBACK_update(node) {
    node._update_lod();
  }
  async _update_lod() {
    if (this.p.auto_update) {
      return;
    }
    const camera_param = this.p.camera;
    if (camera_param.is_dirty) {
      await camera_param.compute();
    }
    let camera_node = camera_param.found_node_with_context_and_type(NodeContext2.OBJ, CameraNodeType.PERSPECTIVE) || camera_param.found_node_with_context_and_type(NodeContext2.OBJ, CameraNodeType.ORTHOGRAPHIC);
    if (camera_node) {
      const object = camera_node.object;
      this._lod.update(object);
    } else {
      this.states.error.set("no camera node found");
    }
  }
}

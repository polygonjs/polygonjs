import {TypedPostProcessNode, PostParamOptions} from "./_Base";
import {MaskPass as MaskPass2} from "../../../modules/three/examples/jsm/postprocessing/MaskPass";
import {NodeContext as NodeContext2} from "../../poly/NodeContext";
import {SceneObjNode} from "../obj/Scene";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class MaskPostParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.override_scene = ParamConfig.BOOLEAN(0, PostParamOptions);
    this.scene = ParamConfig.OPERATOR_PATH("/scene1", {
      visible_if: {override_scene: 1},
      node_selection: {
        context: NodeContext2.OBJ,
        types: [SceneObjNode.type()]
      },
      ...PostParamOptions
    });
    this.override_camera = ParamConfig.BOOLEAN(0, PostParamOptions);
    this.camera = ParamConfig.OPERATOR_PATH("/perspective_camera1", {
      visible_if: {override_camera: 1},
      node_selection: {
        context: NodeContext2.OBJ
      },
      ...PostParamOptions
    });
    this.inverse = ParamConfig.BOOLEAN(0, PostParamOptions);
  }
}
const ParamsConfig2 = new MaskPostParamsConfig();
export class MaskPostNode extends TypedPostProcessNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "mask";
  }
  _create_pass(context) {
    const pass = new MaskPass2(context.scene, context.camera);
    pass.context = {
      scene: context.scene,
      camera: context.camera
    };
    this.update_pass(pass);
    return pass;
  }
  update_pass(pass) {
    pass.inverse = this.pv.inverse;
    this._update_scene(pass);
    this._update_camera(pass);
  }
  async _update_scene(pass) {
    if (this.pv.override_scene) {
      if (this.p.scene.is_dirty) {
        await this.p.scene.compute();
      }
      const scene_node = this.p.scene.found_node_with_expected_type();
      if (scene_node) {
        pass.scene = scene_node.object;
        return;
      }
    }
    pass.scene = pass.context.scene;
  }
  async _update_camera(pass) {
    if (this.pv.override_camera) {
      if (this.p.camera.is_dirty) {
        await this.p.camera.compute();
      }
      const camera_node = this.p.camera.found_node_with_expected_type();
      if (camera_node) {
        pass.camera = camera_node.object;
        return;
      }
    }
    pass.camera = pass.context.camera;
  }
}

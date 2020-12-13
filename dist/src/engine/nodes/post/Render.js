import {TypedPostProcessNode, PostParamOptions} from "./_Base";
import {RenderPass as RenderPass2} from "../../../modules/three/examples/jsm/postprocessing/RenderPass";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {CameraNodeType, NodeContext as NodeContext2} from "../../poly/NodeContext";
import {SceneObjNode} from "../obj/Scene";
class RenderPostParamsConfig extends NodeParamsConfig {
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
  }
}
const ParamsConfig2 = new RenderPostParamsConfig();
export class RenderPostNode extends TypedPostProcessNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "render";
  }
  _create_pass(context) {
    const pass = new RenderPass2(context.scene, context.camera);
    pass.context = {
      camera: context.camera,
      scene: context.scene
    };
    this.update_pass(pass);
    return pass;
  }
  update_pass(pass) {
    this._update_camera(pass);
    this._update_scene(pass);
  }
  async _update_camera(pass) {
    if (this.pv.override_camera) {
      if (this.p.camera.is_dirty) {
        await this.p.camera.compute();
      }
      const obj_node = this.p.camera.found_node_with_context(NodeContext2.OBJ);
      if (obj_node) {
        if (obj_node.type == CameraNodeType.PERSPECTIVE || obj_node.type == CameraNodeType.ORTHOGRAPHIC) {
          const camera = obj_node.object;
          pass.camera = camera;
        }
      }
    } else {
      pass.camera = pass.context.camera;
    }
  }
  async _update_scene(pass) {
    if (this.pv.override_scene) {
      if (this.p.camera.is_dirty) {
        await this.p.scene.compute();
      }
      const obj_node = this.p.scene.found_node_with_context(NodeContext2.OBJ);
      if (obj_node) {
        if (obj_node.type == SceneObjNode.type()) {
          const scene = obj_node.object;
          pass.scene = scene;
        }
      }
    } else {
      pass.scene = pass.context.scene;
    }
  }
}

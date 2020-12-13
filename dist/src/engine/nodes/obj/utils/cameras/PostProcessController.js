import {BaseThreejsCameraObjNodeClass} from "../../_BaseCamera";
import {NetworkNodeType} from "../../../../poly/NodeContext";
const POST_PROCESS_PARAM_OPTIONS = {
  callback: (node) => {
    BaseThreejsCameraObjNodeClass.PARAM_CALLBACK_reset_effects_composer(node);
  }
};
import {ParamConfig} from "../../../utils/params/ParamsConfig";
export function CameraPostProcessParamConfig(Base2) {
  return class Mixin extends Base2 {
    constructor() {
      super(...arguments);
      this.do_post_process = ParamConfig.BOOLEAN(0);
      this.post_process_node = ParamConfig.OPERATOR_PATH("./post_process1", {
        visible_if: {
          do_post_process: 1
        },
        node_selection: {
          types: [NetworkNodeType.POST]
        },
        ...POST_PROCESS_PARAM_OPTIONS
      });
    }
  };
}
export class PostProcessController {
  constructor(node) {
    this.node = node;
    this._composers_by_canvas_id = {};
    if (this.node.p.post_process_node) {
      this._add_param_dirty_hook();
    } else {
      this.node.params.on_params_created("post process add param dirty hook", () => {
        this._add_param_dirty_hook();
      });
    }
  }
  _add_param_dirty_hook() {
    this.node.p.post_process_node.add_post_dirty_hook("on_post_node_dirty", () => {
      this.reset();
    });
  }
  render(canvas, size) {
    const composer = this.composer(canvas);
    if (composer) {
      if (size) {
        composer.setSize(size.x, size.y);
      }
      composer.render();
    }
  }
  reset() {
    const ids = Object.keys(this._composers_by_canvas_id);
    for (let id of ids) {
      delete this._composers_by_canvas_id[id];
    }
  }
  composer(canvas) {
    return this._composers_by_canvas_id[canvas.id] = this._composers_by_canvas_id[canvas.id] || this._create_composer(canvas);
  }
  _create_composer(canvas) {
    const renderer = this.node.render_controller.renderer(canvas);
    if (renderer) {
      const scene = this.node.render_controller.resolved_scene || this.node.scene.default_scene;
      const camera = this.node.object;
      const found_node = this.node.p.post_process_node.found_node();
      if (found_node) {
        if (found_node.type == NetworkNodeType.POST) {
          const post_process_network = found_node;
          const resolution = this.node.render_controller.canvas_resolution(canvas);
          const composer = post_process_network.effects_composer_controller.create_effects_composer({
            renderer,
            scene,
            camera,
            resolution,
            requester: this.node,
            camera_node: this.node
          });
          return composer;
        } else {
          this.node.states.error.set("found node is not a post process node");
        }
      } else {
        this.node.states.error.set("no post node found");
      }
    }
  }
}

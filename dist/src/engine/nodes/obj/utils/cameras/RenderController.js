import {WebGLRenderer as WebGLRenderer2} from "three/src/renderers/WebGLRenderer";
import {Vector2 as Vector22} from "three/src/math/Vector2";
import {NodeContext as NodeContext2} from "../../../../poly/NodeContext";
import {SceneObjNode} from "../../Scene";
import {Poly as Poly2} from "../../../../Poly";
import {
  WebGlRendererRopNode,
  DEFAULT_SHADOW_MAP_TYPE,
  DEFAULT_OUTPUT_ENCODING,
  DEFAULT_TONE_MAPPING
} from "../../../rop/WebglRenderer";
import {RopType} from "../../../../poly/registers/nodes/Rop";
import {ParamConfig} from "../../../utils/params/ParamsConfig";
export function CameraRenderParamConfig(Base) {
  return class Mixin extends Base {
    constructor() {
      super(...arguments);
      this.render = ParamConfig.FOLDER();
      this.set_scene = ParamConfig.BOOLEAN(0);
      this.scene = ParamConfig.OPERATOR_PATH("/scene1", {
        visible_if: {set_scene: 1},
        node_selection: {
          context: NodeContext2.OBJ,
          types: [SceneObjNode.type()]
        }
      });
      this.set_renderer = ParamConfig.BOOLEAN(0);
      this.renderer = ParamConfig.OPERATOR_PATH("./renderers1/webgl_renderer1", {
        visible_if: {set_renderer: 1},
        node_selection: {
          context: NodeContext2.ROP,
          types: [WebGlRendererRopNode.type()]
        }
      });
      this.set_css_renderer = ParamConfig.BOOLEAN(0);
      this.css_renderer = ParamConfig.OPERATOR_PATH("./renderers1/css2d_renderer1", {
        visible_if: {set_css_renderer: 1},
        node_selection: {
          context: NodeContext2.ROP,
          types: [RopType.CSS2D, RopType.CSS3D]
        }
      });
    }
  };
}
export class RenderController {
  constructor(node) {
    this.node = node;
    this._renderers_by_canvas_id = {};
    this._resolution_by_canvas_id = {};
    this._super_sampling_size = new Vector22();
  }
  render(canvas, size, aspect) {
    if (this.node.pv.do_post_process) {
      this.node.post_process_controller.render(canvas, size);
    } else {
      this.render_with_renderer(canvas);
    }
    if (this._resolved_css_renderer_rop && this._resolved_scene && this.node.pv.set_css_renderer) {
      const css_renderer = this.css_renderer(canvas);
      if (css_renderer) {
        css_renderer.render(this._resolved_scene, this.node.object);
      }
    }
  }
  render_with_renderer(canvas) {
    const renderer = this.renderer(canvas);
    if (renderer) {
      if (this._resolved_scene) {
        renderer.render(this._resolved_scene, this.node.object);
      }
    }
  }
  async update() {
    this.update_scene();
    this.update_renderer();
    this.update_css_renderer();
  }
  get resolved_scene() {
    return this._resolved_scene;
  }
  update_scene() {
    if (this.node.pv.set_scene) {
      const param = this.node.p.scene;
      if (param.is_dirty) {
        param.find_target();
      }
      const node = param.found_node_with_context_and_type(NodeContext2.OBJ, SceneObjNode.type());
      if (node) {
        if (node.is_dirty) {
          node.cook_controller.cook_main_without_inputs();
        }
        this._resolved_scene = node.object;
      }
    } else {
      this._resolved_scene = this.node.scene.default_scene;
    }
  }
  update_renderer() {
    if (this.node.pv.set_renderer) {
      const param = this.node.p.renderer;
      if (param.is_dirty) {
        param.find_target();
      }
      this._resolved_renderer_rop = param.found_node_with_context_and_type(NodeContext2.ROP, RopType.WEBGL);
    } else {
      this._resolved_renderer_rop = void 0;
    }
  }
  update_css_renderer() {
    if (this.node.pv.set_css_renderer) {
      const param = this.node.p.css_renderer;
      if (param.is_dirty) {
        param.find_target();
      }
      this._resolved_css_renderer_rop = param.found_node_with_context_and_type(NodeContext2.ROP, [
        RopType.CSS2D,
        RopType.CSS3D
      ]);
    } else {
      if (this._resolved_css_renderer_rop) {
      }
      this._resolved_css_renderer_rop = void 0;
    }
  }
  renderer(canvas) {
    return this._renderers_by_canvas_id[canvas.id];
  }
  css_renderer(canvas) {
    if (this._resolved_css_renderer_rop && this.node.pv.set_css_renderer) {
      return this._resolved_css_renderer_rop.renderer(canvas);
    }
  }
  create_renderer(canvas, size) {
    const gl = Poly2.instance().renderers_controller.rendering_context(canvas);
    if (!gl) {
      console.error("failed to create webgl context");
      return;
    }
    let renderer;
    if (this.node.pv.set_renderer) {
      this.update_renderer();
      if (this._resolved_renderer_rop) {
        renderer = this._resolved_renderer_rop.create_renderer(canvas, gl);
      }
    }
    if (!renderer) {
      renderer = RenderController._create_default_renderer(canvas, gl);
    }
    Poly2.instance().renderers_controller.register_renderer(renderer);
    this._renderers_by_canvas_id[canvas.id] = renderer;
    this._super_sampling_size.copy(size);
    if (renderer.sampling) {
      this._super_sampling_size.multiplyScalar(renderer.sampling);
    }
    this.set_renderer_size(canvas, this._super_sampling_size);
    return renderer;
  }
  static _create_default_renderer(canvas, gl) {
    const renderer = new WebGLRenderer2({
      canvas,
      antialias: true,
      alpha: true,
      context: gl
    });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = DEFAULT_SHADOW_MAP_TYPE;
    renderer.physicallyCorrectLights = true;
    renderer.toneMapping = DEFAULT_TONE_MAPPING;
    renderer.toneMappingExposure = 1;
    renderer.outputEncoding = DEFAULT_OUTPUT_ENCODING;
    return renderer;
  }
  delete_renderer(canvas) {
    const renderer = this.renderer(canvas);
    if (renderer) {
      Poly2.instance().renderers_controller.deregister_renderer(renderer);
    }
  }
  canvas_resolution(canvas) {
    return this._resolution_by_canvas_id[canvas.id];
  }
  set_renderer_size(canvas, size) {
    this._resolution_by_canvas_id[canvas.id] = this._resolution_by_canvas_id[canvas.id] || new Vector22();
    this._resolution_by_canvas_id[canvas.id].copy(size);
    const renderer = this.renderer(canvas);
    if (renderer) {
      const update_style = false;
      renderer.setSize(size.x, size.y, update_style);
    }
    if (this._resolved_css_renderer_rop) {
      const css_renderer = this.css_renderer(canvas);
      if (css_renderer) {
        css_renderer.setSize(size.x, size.y);
      }
    }
  }
}

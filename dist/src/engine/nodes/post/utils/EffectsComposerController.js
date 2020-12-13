import {EffectComposer as EffectComposer2} from "../../../../modules/three/examples/jsm/postprocessing/EffectComposer";
import {RenderPass as RenderPass2} from "../../../../modules/three/examples/jsm/postprocessing/RenderPass";
import {Vector2 as Vector22} from "three/src/math/Vector2";
import {NodeParamsConfig, ParamConfig} from "../../utils/params/ParamsConfig";
import {RGBFormat} from "three/src/constants";
import {Poly as Poly2} from "../../../Poly";
import {
  MAG_FILTER_DEFAULT_VALUE,
  MAG_FILTER_MENU_ENTRIES,
  MIN_FILTER_DEFAULT_VALUE,
  MIN_FILTER_MENU_ENTRIES
} from "../../../../core/cop/ConstantFilter";
export class PostProcessNetworkParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.prepend_render_pass = ParamConfig.BOOLEAN(1);
    this.use_render_target = ParamConfig.BOOLEAN(1);
    this.tmag_filter = ParamConfig.BOOLEAN(0, {
      visible_if: {use_render_target: 1}
    });
    this.mag_filter = ParamConfig.INTEGER(MAG_FILTER_DEFAULT_VALUE, {
      visible_if: {use_render_target: 1, tmag_filter: 1},
      menu: {
        entries: MAG_FILTER_MENU_ENTRIES
      }
    });
    this.tmin_filter = ParamConfig.BOOLEAN(0, {
      visible_if: {use_render_target: 1}
    });
    this.min_filter = ParamConfig.INTEGER(MIN_FILTER_DEFAULT_VALUE, {
      visible_if: {use_render_target: 1, tmin_filter: 1},
      menu: {
        entries: MIN_FILTER_MENU_ENTRIES
      }
    });
    this.stencil_buffer = ParamConfig.BOOLEAN(0, {
      visible_if: {use_render_target: 1}
    });
    this.sampling = ParamConfig.INTEGER(1, {
      range: [1, 4],
      range_locked: [true, false]
    });
  }
}
export class EffectsComposerController {
  constructor(node) {
    this.node = node;
    this._renderer_size = new Vector22();
  }
  display_node_controller_callbacks() {
    return {
      on_display_node_remove: () => {
      },
      on_display_node_set: () => {
        this.node.set_dirty();
      },
      on_display_node_update: () => {
        this.node.set_dirty();
      }
    };
  }
  create_effects_composer(options) {
    const renderer = options.renderer;
    let composer;
    if (this.node.pv.use_render_target) {
      const render_target = this._create_render_target(renderer);
      composer = new EffectComposer2(renderer, render_target);
    } else {
      composer = new EffectComposer2(renderer);
    }
    composer.setPixelRatio(window.devicePixelRatio * this.node.pv.sampling);
    this._build_passes(composer, options);
    return composer;
  }
  _create_render_target(renderer) {
    let render_target;
    renderer.autoClear = false;
    const parameters = {
      format: RGBFormat,
      stencilBuffer: this.node.pv.stencil_buffer
    };
    if (this.node.pv.tminfilter) {
      parameters.minFilter = this.node.pv.min_filter;
    }
    if (this.node.pv.tminfilter) {
      parameters.magFilter = this.node.pv.mag_filter;
    }
    renderer.getDrawingBufferSize(this._renderer_size);
    render_target = Poly2.instance().renderers_controller.render_target(this._renderer_size.x, this._renderer_size.y, parameters);
    return render_target;
  }
  _build_passes(composer, options) {
    if (this.node.pv.prepend_render_pass == true) {
      const render_pass = new RenderPass2(options.scene, options.camera);
      composer.addPass(render_pass);
    }
    const post_node = this.node.display_node_controller.display_node;
    if (post_node) {
      post_node.setup_composer({
        composer,
        camera: options.camera,
        resolution: options.resolution,
        camera_node: options.camera_node,
        scene: options.scene,
        requester: options.requester
      });
    }
  }
}

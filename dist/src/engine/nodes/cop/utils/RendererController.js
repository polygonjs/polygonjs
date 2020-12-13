import {WebGLRenderer as WebGLRenderer2} from "three/src/renderers/WebGLRenderer";
import {LinearToneMapping} from "three/src/constants";
import {TypedCopNode} from "../_Base";
import {NodeParamsConfig, ParamConfig} from "../../utils/params/ParamsConfig";
import {Poly as Poly2} from "../../../Poly";
class BaseCopRendererCopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.use_camera_renderer = ParamConfig.BOOLEAN(0);
  }
}
const ParamsConfig2 = new BaseCopRendererCopParamsConfig();
export class BaseCopRendererCopNode extends TypedCopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
}
export class CopRendererController {
  constructor(node) {
    this.node = node;
  }
  async renderer() {
    if (this.node.pv.use_camera_renderer) {
      return await this.camera_renderer();
    } else {
      return this._renderer = this._renderer || this._create_renderer();
    }
  }
  reset() {
    this._renderer?.dispose();
    this._renderer = void 0;
  }
  async camera_renderer() {
    let renderer = Poly2.instance().renderers_controller.first_renderer();
    if (renderer) {
      return renderer;
    } else {
      return await Poly2.instance().renderers_controller.wait_for_renderer();
    }
  }
  save_state() {
    this.make_linear();
  }
  make_linear() {
  }
  restore_state() {
  }
  _create_renderer() {
    const renderer = new WebGLRenderer2();
    renderer.toneMapping = LinearToneMapping;
    renderer.setPixelRatio(1);
    return renderer;
  }
}

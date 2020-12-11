import {TypedRopNode} from "./_Base";
import {CSS3DRenderer as CSS3DRenderer2} from "../../../modules/three/examples/jsm/renderers/CSS3DRenderer";
import {RopType} from "../../poly/registers/nodes/Rop";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class Css3DRendererRopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.css = ParamConfig.STRING("", {
      multiline: true
    });
  }
}
const ParamsConfig2 = new Css3DRendererRopParamsConfig();
export class Css3DRendererRopNode extends TypedRopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this._renderers_by_canvas_id = {};
  }
  static type() {
    return RopType.CSS3D;
  }
  create_renderer(canvas) {
    const renderer = new CSS3DRenderer2();
    this._renderers_by_canvas_id[canvas.id] = renderer;
    const parent = canvas.parentElement;
    if (parent) {
      parent.prepend(renderer.domElement);
      parent.style.position = "relative";
    }
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.top = "0px";
    renderer.domElement.style.left = "0px";
    renderer.domElement.style.pointerEvents = "none";
    renderer.setSize(canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);
    return renderer;
  }
  renderer(canvas) {
    return this._renderers_by_canvas_id[canvas.id] || this.create_renderer(canvas);
  }
  cook() {
    this.cook_controller.end_cook();
  }
}

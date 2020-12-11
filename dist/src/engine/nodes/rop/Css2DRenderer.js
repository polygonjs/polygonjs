import {TypedRopNode} from "./_Base";
import {CSS2DRenderer as CSS2DRenderer2} from "../../../modules/core/renderers/CSS2DRenderer";
import {RopType} from "../../poly/registers/nodes/Rop";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class Css2DRendererRopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.css = ParamConfig.STRING("", {
      multiline: true
    });
    this.sort_objects = ParamConfig.BOOLEAN(0);
    this.use_fog = ParamConfig.BOOLEAN(0);
    this.fog_near = ParamConfig.FLOAT(1, {
      range: [0, 100],
      range_locked: [true, false],
      visible_if: {use_fog: 1}
    });
    this.fog_far = ParamConfig.FLOAT(100, {
      range: [0, 100],
      range_locked: [true, false],
      visible_if: {use_fog: 1}
    });
  }
}
const ParamsConfig2 = new Css2DRendererRopParamsConfig();
export class Css2DRendererRopNode extends TypedRopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this._renderers_by_canvas_id = new Map();
  }
  static type() {
    return RopType.CSS2D;
  }
  create_renderer(canvas) {
    const renderer = new CSS2DRenderer2();
    this._renderers_by_canvas_id.set(canvas.id, renderer);
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
    this._update_renderer(renderer);
    return renderer;
  }
  renderer(canvas) {
    return this._renderers_by_canvas_id.get(canvas.id) || this.create_renderer(canvas);
  }
  cook() {
    this._update_css();
    this._renderers_by_canvas_id.forEach((renderer) => {
      this._update_renderer(renderer);
    });
    this.cook_controller.end_cook();
  }
  _update_renderer(renderer) {
    renderer.set_sorting(this.pv.sort_objects);
    renderer.set_use_fog(this.pv.use_fog);
    renderer.set_fog_range(this.pv.fog_near, this.pv.fog_far);
  }
  _update_css() {
    const element = this.css_element();
    element.innerHTML = this.pv.css;
  }
  css_element() {
    return this._css_element = this._css_element || this._find_element() || this._create_element();
  }
  _find_element() {
    return document.getElementById(this._css_element_id());
  }
  _create_element() {
    const style = document.createElement("style");
    style.appendChild(document.createTextNode(""));
    document.head.appendChild(style);
    style.id = this._css_element_id();
    return style;
  }
  _css_element_id() {
    return `css_2d_renderer-${this.graph_node_id}`;
  }
}

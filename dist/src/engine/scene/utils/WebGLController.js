import {Poly as Poly2} from "../../Poly";
export class WebGLController {
  constructor() {
    this._require_webgl2 = false;
  }
  require_webgl2() {
    return this._require_webgl2;
  }
  set_require_webgl2() {
    if (!this._require_webgl2) {
      this._require_webgl2 = true;
      Poly2.instance().renderers_controller.set_require_webgl2();
    }
  }
}

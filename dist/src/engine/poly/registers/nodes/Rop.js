import {CATEGORY_ROP} from "./Category";
import {Css2DRendererRopNode} from "../../../nodes/rop/Css2DRenderer";
import {WebGlRendererRopNode} from "../../../nodes/rop/WebglRenderer";
export var RopType;
(function(RopType2) {
  RopType2["CSS2D"] = "css2d_renderer";
  RopType2["CSS3D"] = "css3d_renderer";
  RopType2["WEBGL"] = "webgl_renderer";
})(RopType || (RopType = {}));
export class RopRegister {
  static run(poly) {
    poly.registerNode(Css2DRendererRopNode, CATEGORY_ROP.CSS);
    poly.registerNode(WebGlRendererRopNode, CATEGORY_ROP.WEBGL);
  }
}

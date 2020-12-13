import {ShadowMaterial as ShadowMaterial2} from "three/src/materials/ShadowMaterial";
import {FrontSide} from "three/src/constants";
import {TypedMatNode} from "./_Base";
import {NodeParamsConfig} from "../utils/params/ParamsConfig";
import {ColorsController as ColorsController2, ColorParamConfig} from "./utils/ColorsController";
import {SideController as SideController2, SideParamConfig} from "./utils/SideController";
class MeshBasicMatParamsConfig extends SideParamConfig(ColorParamConfig(NodeParamsConfig)) {
}
const ParamsConfig2 = new MeshBasicMatParamsConfig();
export class ShadowMatNode extends TypedMatNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "shadow";
  }
  create_material() {
    return new ShadowMaterial2({
      vertexColors: false,
      side: FrontSide,
      color: 16777215,
      opacity: 1
    });
  }
  initialize_node() {
  }
  async cook() {
    ColorsController2.update(this);
    SideController2.update(this);
    this.set_material(this.material);
  }
}

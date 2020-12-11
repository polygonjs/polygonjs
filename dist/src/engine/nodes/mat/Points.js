import {PointsMaterial as PointsMaterial2} from "three/src/materials/PointsMaterial";
import {FrontSide} from "three/src/constants";
import {TypedMatNode} from "./_Base";
import {ColorsController as ColorsController2, ColorParamConfig} from "./utils/ColorsController";
import {SideController as SideController2, SideParamConfig} from "./utils/SideController";
import {DepthController as DepthController2, DepthParamConfig} from "./utils/DepthController";
import {TextureMapController as TextureMapController2, TextureMapParamConfig} from "./utils/TextureMapController";
import {TextureAlphaMapController as TextureAlphaMapController2, TextureAlphaMapParamConfig} from "./utils/TextureAlphaMapController";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
export function PointsParamConfig(Base2) {
  return class Mixin extends Base2 {
    constructor() {
      super(...arguments);
      this.size = ParamConfig.FLOAT(1);
      this.size_attenuation = ParamConfig.BOOLEAN(1);
    }
  };
}
class PointsMatParamsConfig extends TextureAlphaMapParamConfig(TextureMapParamConfig(DepthParamConfig(SideParamConfig(ColorParamConfig(PointsParamConfig(NodeParamsConfig)))))) {
}
const ParamsConfig2 = new PointsMatParamsConfig();
export class PointsMatNode extends TypedMatNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this.texture_map_controller = new TextureMapController2(this, {direct_params: true});
    this.texture_alpha_map_controller = new TextureAlphaMapController2(this, {
      direct_params: true
    });
    this.depth_controller = new DepthController2(this);
  }
  static type() {
    return "points";
  }
  create_material() {
    return new PointsMaterial2({
      vertexColors: false,
      side: FrontSide,
      color: 16777215,
      opacity: 1
    });
  }
  initialize_node() {
    this.params.on_params_created("init controllers", () => {
      this.texture_map_controller.initialize_node();
      this.texture_alpha_map_controller.initialize_node();
    });
  }
  async cook() {
    ColorsController2.update(this);
    SideController2.update(this);
    this.texture_map_controller.update();
    this.texture_alpha_map_controller.update();
    this.depth_controller.update();
    this.material.size = this.pv.size;
    this.material.sizeAttenuation = this.pv.size_attenuation;
    this.set_material(this.material);
  }
}

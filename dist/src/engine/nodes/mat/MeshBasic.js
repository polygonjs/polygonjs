import {MeshBasicMaterial as MeshBasicMaterial2} from "three/src/materials/MeshBasicMaterial";
import {FrontSide} from "three/src/constants";
import {TypedMatNode} from "./_Base";
import {NodeParamsConfig} from "../utils/params/ParamsConfig";
import {ColorsController as ColorsController2, ColorParamConfig} from "./utils/ColorsController";
import {SideController as SideController2, SideParamConfig} from "./utils/SideController";
import {DepthController as DepthController2, DepthParamConfig} from "./utils/DepthController";
import {SkinningController as SkinningController2, SkinningParamConfig} from "./utils/SkinningController";
import {TextureMapController as TextureMapController2, TextureMapParamConfig} from "./utils/TextureMapController";
import {TextureAlphaMapController as TextureAlphaMapController2, TextureAlphaMapParamConfig} from "./utils/TextureAlphaMapController";
class MeshBasicMatParamsConfig extends TextureAlphaMapParamConfig(TextureMapParamConfig(SkinningParamConfig(DepthParamConfig(SideParamConfig(ColorParamConfig(NodeParamsConfig)))))) {
}
const ParamsConfig2 = new MeshBasicMatParamsConfig();
export class MeshBasicMatNode extends TypedMatNode {
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
    return "mesh_basic";
  }
  create_material() {
    return new MeshBasicMaterial2({
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
    SkinningController2.update(this);
    this.texture_map_controller.update();
    this.texture_alpha_map_controller.update();
    this.depth_controller.update();
    this.set_material(this.material);
  }
}

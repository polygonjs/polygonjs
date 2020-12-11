import {MeshStandardMaterial as MeshStandardMaterial2} from "three/src/materials/MeshStandardMaterial";
import {FrontSide} from "three/src/constants";
import {TypedMatNode} from "./_Base";
import {ParamConfig, NodeParamsConfig} from "../utils/params/ParamsConfig";
import {ColorsController as ColorsController2, ColorParamConfig} from "./utils/ColorsController";
import {SideController as SideController2, SideParamConfig} from "./utils/SideController";
import {DepthController as DepthController2, DepthParamConfig} from "./utils/DepthController";
import {SkinningController as SkinningController2, SkinningParamConfig} from "./utils/SkinningController";
import {TextureMapController as TextureMapController2, TextureMapParamConfig} from "./utils/TextureMapController";
import {TextureAlphaMapController as TextureAlphaMapController2, TextureAlphaMapParamConfig} from "./utils/TextureAlphaMapController";
import {TextureEnvMapController as TextureEnvMapController2, TextureEnvMapParamConfig} from "./utils/TextureEnvMapController";
export const SHADER_DEFAULTS = {
  metalness: 1,
  roughness: 0.5
};
class MeshStandardMatParamsConfig extends TextureEnvMapParamConfig(TextureAlphaMapParamConfig(TextureMapParamConfig(SkinningParamConfig(DepthParamConfig(SideParamConfig(ColorParamConfig(NodeParamsConfig))))))) {
  constructor() {
    super(...arguments);
    this.metalness = ParamConfig.FLOAT(SHADER_DEFAULTS.metalness);
    this.roughness = ParamConfig.FLOAT(SHADER_DEFAULTS.roughness);
  }
}
const ParamsConfig2 = new MeshStandardMatParamsConfig();
export class MeshStandardMatNode extends TypedMatNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this.texture_map_controller = new TextureMapController2(this, {direct_params: true});
    this.texture_alpha_map_controller = new TextureAlphaMapController2(this, {
      direct_params: true
    });
    this.texture_env_map_controller = new TextureEnvMapController2(this, {
      direct_params: true
    });
    this.depth_controller = new DepthController2(this);
  }
  static type() {
    return "mesh_standard";
  }
  create_material() {
    return new MeshStandardMaterial2({
      vertexColors: false,
      side: FrontSide,
      color: 16777215,
      opacity: 1,
      metalness: 1,
      roughness: 0
    });
  }
  initialize_node() {
    this.params.on_params_created("init controllers", () => {
      this.texture_map_controller.initialize_node();
      this.texture_alpha_map_controller.initialize_node();
      this.texture_env_map_controller.initialize_node();
    });
  }
  async cook() {
    ColorsController2.update(this);
    SideController2.update(this);
    SkinningController2.update(this);
    this.texture_map_controller.update();
    this.texture_alpha_map_controller.update();
    this.texture_env_map_controller.update();
    if (this._material) {
      this._material.envMapIntensity = this.pv.env_map_intensity;
      this._material.roughness = this.pv.roughness;
      this._material.metalness = this.pv.metalness;
    }
    this.depth_controller.update();
    this.set_material(this.material);
  }
}

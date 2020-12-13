import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {ColorParamConfig, ColorsController} from "./utils/UniformsColorsController";
import {SideParamConfig, SideController as SideController2} from "./utils/SideController";
import {DepthController as DepthController2, DepthParamConfig} from "./utils/DepthController";
import {SkinningParamConfig, SkinningController as SkinningController2} from "./utils/SkinningController";
import {TextureMapParamConfig, TextureMapController as TextureMapController2} from "./utils/TextureMapController";
import {TextureAlphaMapParamConfig, TextureAlphaMapController as TextureAlphaMapController2} from "./utils/TextureAlphaMapController";
import {TextureEnvMapController as TextureEnvMapController2, TextureEnvMapParamConfig} from "./utils/TextureEnvMapController";
import {TypedBuilderMatNode} from "./_BaseBuilder";
import {AssemblerName} from "../../poly/registers/assemblers/_BaseRegister";
import {Poly as Poly2} from "../../Poly";
import {SHADER_DEFAULTS} from "./MeshStandard";
class MeshStandardMatParamsConfig extends TextureEnvMapParamConfig(TextureAlphaMapParamConfig(TextureMapParamConfig(SkinningParamConfig(DepthParamConfig(SideParamConfig(ColorParamConfig(NodeParamsConfig))))))) {
  constructor() {
    super(...arguments);
    this.metalness = ParamConfig.FLOAT(SHADER_DEFAULTS.metalness, {
      cook: false,
      callback: (node, param) => MeshStandardBuilderMatNode._update_metalness(node)
    });
    this.roughness = ParamConfig.FLOAT(SHADER_DEFAULTS.roughness, {
      cook: false,
      callback: (node, param) => MeshStandardBuilderMatNode._update_roughness(node)
    });
  }
}
const ParamsConfig2 = new MeshStandardMatParamsConfig();
export class MeshStandardBuilderMatNode extends TypedBuilderMatNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this.texture_map_controller = new TextureMapController2(this, {uniforms: true});
    this.texture_alpha_map_controller = new TextureAlphaMapController2(this, {
      uniforms: true
    });
    this.texture_env_map_controller = new TextureEnvMapController2(this, {
      uniforms: true,
      direct_params: true
    });
    this.depth_controller = new DepthController2(this);
  }
  static type() {
    return "mesh_standard_builder";
  }
  used_assembler() {
    return AssemblerName.GL_MESH_STANDARD;
  }
  _create_assembler_controller() {
    return Poly2.instance().assemblersRegister.assembler(this, this.used_assembler());
  }
  initialize_node() {
    this.params.on_params_created("init controllers", () => {
      this.texture_map_controller.initialize_node();
      this.texture_alpha_map_controller.initialize_node();
      this.texture_env_map_controller.initialize_node();
    });
  }
  async cook() {
    this.compile_if_required();
    ColorsController.update(this);
    SideController2.update(this);
    SkinningController2.update(this);
    TextureMapController2.update(this);
    TextureAlphaMapController2.update(this);
    TextureEnvMapController2.update(this);
    this.depth_controller.update();
    if (this._material) {
      this._material.uniforms.envMapIntensity.value = this.pv.env_map_intensity;
      MeshStandardBuilderMatNode._update_metalness(this);
      MeshStandardBuilderMatNode._update_roughness(this);
    }
    this.set_material(this.material);
  }
  static _update_metalness(node) {
    node.material.uniforms.metalness.value = node.pv.metalness;
  }
  static _update_roughness(node) {
    node.material.uniforms.roughness.value = node.pv.roughness;
  }
}

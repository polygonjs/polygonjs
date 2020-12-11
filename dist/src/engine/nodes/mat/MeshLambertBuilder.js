import {NodeParamsConfig} from "../utils/params/ParamsConfig";
import {ColorParamConfig, ColorsController} from "./utils/UniformsColorsController";
import {SideParamConfig, SideController as SideController2} from "./utils/SideController";
import {DepthController as DepthController2, DepthParamConfig} from "./utils/DepthController";
import {SkinningParamConfig, SkinningController as SkinningController2} from "./utils/SkinningController";
import {TextureMapParamConfig, TextureMapController as TextureMapController2} from "./utils/TextureMapController";
import {TextureAlphaMapParamConfig, TextureAlphaMapController as TextureAlphaMapController2} from "./utils/TextureAlphaMapController";
import {TypedBuilderMatNode} from "./_BaseBuilder";
import {AssemblerName} from "../../poly/registers/assemblers/_BaseRegister";
import {Poly as Poly2} from "../../Poly";
class MeshLambertMatParamsConfig extends TextureAlphaMapParamConfig(TextureMapParamConfig(SkinningParamConfig(DepthParamConfig(SideParamConfig(ColorParamConfig(NodeParamsConfig)))))) {
}
const ParamsConfig2 = new MeshLambertMatParamsConfig();
export class MeshLambertBuilderMatNode extends TypedBuilderMatNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this.texture_map_controller = new TextureMapController2(this, {uniforms: true});
    this.texture_alpha_map_controller = new TextureAlphaMapController2(this, {
      uniforms: true
    });
    this.depth_controller = new DepthController2(this);
  }
  static type() {
    return "mesh_lambert_builder";
  }
  used_assembler() {
    return AssemblerName.GL_MESH_LAMBERT;
  }
  _create_assembler_controller() {
    return Poly2.instance().assemblers_register.assembler(this, this.used_assembler());
  }
  initialize_node() {
    this.params.on_params_created("init controllers", () => {
      this.texture_map_controller.initialize_node();
      this.texture_alpha_map_controller.initialize_node();
    });
  }
  async cook() {
    this.compile_if_required();
    ColorsController.update(this);
    SideController2.update(this);
    SkinningController2.update(this);
    TextureMapController2.update(this);
    TextureAlphaMapController2.update(this);
    this.depth_controller.update();
    this.set_material(this.material);
  }
}

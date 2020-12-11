import {NodeParamsConfig} from "../utils/params/ParamsConfig";
import {ColorParamConfig, ColorsController} from "./utils/UniformsColorsController";
import {SideParamConfig, SideController as SideController2} from "./utils/SideController";
import {DepthController as DepthController2, DepthParamConfig} from "./utils/DepthController";
import {SkinningParamConfig, SkinningController as SkinningController2} from "./utils/SkinningController";
import {TypedBuilderMatNode} from "./_BaseBuilder";
import {AssemblerName} from "../../poly/registers/assemblers/_BaseRegister";
import {Poly as Poly2} from "../../Poly";
class PointsMatParamsConfig extends SkinningParamConfig(DepthParamConfig(SideParamConfig(ColorParamConfig(NodeParamsConfig)))) {
}
const ParamsConfig2 = new PointsMatParamsConfig();
export class PointsBuilderMatNode extends TypedBuilderMatNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this.depth_controller = new DepthController2(this);
  }
  static type() {
    return "points_builder";
  }
  used_assembler() {
    return AssemblerName.GL_POINTS;
  }
  _create_assembler_controller() {
    return Poly2.instance().assemblersRegister.assembler(this, this.used_assembler());
  }
  initialize_node() {
  }
  async cook() {
    this.compile_if_required();
    ColorsController.update(this);
    SideController2.update(this);
    SkinningController2.update(this);
    this.depth_controller.update();
    this.set_material(this.material);
  }
}

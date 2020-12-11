import {TypedBuilderMatNode} from "./_BaseBuilder";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {VolumeController as VolumeController2} from "./utils/VolumeController";
import {AssemblerName} from "../../poly/registers/assemblers/_BaseRegister";
import {Poly as Poly2} from "../../Poly";
class VolumeMatParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.color = ParamConfig.COLOR([1, 1, 1]);
    this.step_size = ParamConfig.FLOAT(0.01);
    this.density = ParamConfig.FLOAT(1);
    this.shadow_density = ParamConfig.FLOAT(1);
    this.light_dir = ParamConfig.VECTOR3([-1, -1, -1]);
  }
}
const ParamsConfig2 = new VolumeMatParamsConfig();
export class VolumeBuilderMatNode extends TypedBuilderMatNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this._volume_controller = new VolumeController2(this);
  }
  static type() {
    return "volume_builder";
  }
  used_assembler() {
    return AssemblerName.GL_VOLUME;
  }
  _create_assembler_controller() {
    return Poly2.instance().assemblers_register.assembler(this, this.used_assembler());
  }
  initialize_node() {
  }
  async cook() {
    this.compile_if_required();
    this._volume_controller.update_uniforms_from_params();
    this.set_material(this.material);
  }
}

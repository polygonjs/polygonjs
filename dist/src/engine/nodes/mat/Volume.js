import {ShaderMaterial as ShaderMaterial2} from "three/src/materials/ShaderMaterial";
import {FrontSide} from "three/src/constants";
import {TypedMatNode} from "./_Base";
import VERTEX from "../gl/gl/volume/vert.glsl";
import FRAGMENT from "../gl/gl/volume/frag.glsl";
import {VOLUME_UNIFORMS} from "../gl/gl/volume/uniforms";
import {UniformsUtils as UniformsUtils2} from "three/src/renderers/shaders/UniformsUtils";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {CoreMaterial} from "../../../core/geometry/Material";
import {VolumeController as VolumeController2} from "./utils/VolumeController";
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
export class VolumeMatNode extends TypedMatNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this._volume_controller = new VolumeController2(this);
  }
  static type() {
    return "volume";
  }
  create_material() {
    const mat = new ShaderMaterial2({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      side: FrontSide,
      transparent: true,
      depthTest: true,
      uniforms: UniformsUtils2.clone(VOLUME_UNIFORMS)
    });
    CoreMaterial.add_user_data_render_hook(mat, VolumeController2.render_hook.bind(VolumeController2));
    return mat;
  }
  initialize_node() {
  }
  async cook() {
    this._volume_controller.update_uniforms_from_params();
    this.set_material(this.material);
  }
}

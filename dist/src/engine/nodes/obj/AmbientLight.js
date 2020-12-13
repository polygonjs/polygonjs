import {AmbientLight as AmbientLight2} from "three/src/lights/AmbientLight";
import {TypedLightObjNode} from "./_BaseLight";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {ColorConversion} from "../../../core/Color";
class AmbientLightObjParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.color = ParamConfig.COLOR([1, 1, 1], {
      conversion: ColorConversion.SRGB_TO_LINEAR
    });
    this.intensity = ParamConfig.FLOAT(1);
  }
}
const ParamsConfig2 = new AmbientLightObjParamsConfig();
export class AmbientLightObjNode extends TypedLightObjNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "ambient_light";
  }
  create_light() {
    const light = new AmbientLight2();
    light.matrixAutoUpdate = false;
    return light;
  }
  initialize_node() {
    this.io.inputs.set_count(0, 1);
  }
  update_light_params() {
    this.light.color = this.pv.color;
    this.light.intensity = this.pv.intensity;
  }
}

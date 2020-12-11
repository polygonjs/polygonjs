import {Vector2 as Vector22} from "three/src/math/Vector2";
import {TypedPostProcessNode, PostParamOptions} from "./_Base";
import {UnrealBloomPass as UnrealBloomPass2} from "../../../modules/three/examples/jsm/postprocessing/UnrealBloomPass";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class UnrealBloomPostParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.strength = ParamConfig.FLOAT(1.5, {
      range: [0, 3],
      range_locked: [true, false],
      ...PostParamOptions
    });
    this.radius = ParamConfig.FLOAT(1, {
      ...PostParamOptions
    });
    this.threshold = ParamConfig.FLOAT(0, {
      ...PostParamOptions
    });
  }
}
const ParamsConfig2 = new UnrealBloomPostParamsConfig();
export class UnrealBloomPostNode extends TypedPostProcessNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "unreal_bloom";
  }
  _create_pass(context) {
    const pass = new UnrealBloomPass2(new Vector22(context.resolution.x, context.resolution.y), this.pv.strength, this.pv.radius, this.pv.threshold);
    return pass;
  }
  update_pass(pass) {
    pass.strength = this.pv.strength;
    pass.radius = this.pv.radius;
    pass.threshold = this.pv.threshold;
  }
}

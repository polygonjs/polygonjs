import {TypedPostProcessNode, PostParamOptions} from "./_Base";
import {AdaptiveToneMappingPass as AdaptiveToneMappingPass2} from "../../../modules/three/examples/jsm/postprocessing/AdaptiveToneMappingPass";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class AdaptiveToneMappingPostParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.adaptative = ParamConfig.BOOLEAN(1, {
      ...PostParamOptions
    });
    this.average_luminance = ParamConfig.FLOAT(0.7, {
      ...PostParamOptions
    });
    this.mid_grey = ParamConfig.FLOAT(0.04, {
      ...PostParamOptions
    });
    this.max_luminance = ParamConfig.FLOAT(16, {
      range: [0, 20],
      ...PostParamOptions
    });
    this.adaption_rage = ParamConfig.FLOAT(2, {
      range: [0, 10],
      ...PostParamOptions
    });
  }
}
const ParamsConfig2 = new AdaptiveToneMappingPostParamsConfig();
export class AdaptiveToneMappingPostNode extends TypedPostProcessNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "adaptive_tone_mapping";
  }
  _create_pass(context) {
    const pass = new AdaptiveToneMappingPass2(this.pv.adaptative, context.resolution.x);
    this.update_pass(pass);
    return pass;
  }
  update_pass(pass) {
    pass.setMaxLuminance(this.pv.max_luminance);
    pass.setMiddleGrey(this.pv.mid_grey);
    pass.setAverageLuminance(this.pv.average_luminance);
  }
}

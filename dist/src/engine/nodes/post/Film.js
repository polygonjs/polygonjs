import {TypedPostProcessNode, PostParamOptions} from "./_Base";
import {FilmPass as FilmPass2} from "../../../modules/three/examples/jsm/postprocessing/FilmPass";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class FilmPostParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.noise_intensity = ParamConfig.FLOAT(0.5, {
      range: [0, 1],
      range_locked: [false, false],
      ...PostParamOptions
    });
    this.scanlines_intensity = ParamConfig.FLOAT(0.05, {
      range: [0, 1],
      range_locked: [true, false],
      ...PostParamOptions
    });
    this.scanlines_count = ParamConfig.FLOAT(4096, {
      range: [0, 4096],
      range_locked: [true, false],
      ...PostParamOptions
    });
    this.grayscale = ParamConfig.BOOLEAN(1, {
      ...PostParamOptions
    });
  }
}
const ParamsConfig2 = new FilmPostParamsConfig();
export class FilmPostNode extends TypedPostProcessNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "film";
  }
  _create_pass(context) {
    const pass = new FilmPass2(this.pv.noise_intensity, this.pv.scanlines_intensity, this.pv.scanlines_count, this.pv.grayscale ? 1 : 0);
    this.update_pass(pass);
    return pass;
  }
  update_pass(pass) {
    pass.uniforms.nIntensity.value = this.pv.noise_intensity;
    pass.uniforms.sIntensity.value = this.pv.scanlines_intensity;
    pass.uniforms.sCount.value = this.pv.scanlines_count;
    pass.uniforms.grayscale.value = this.pv.grayscale ? 1 : 0;
  }
}

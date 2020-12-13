import {TypedPostProcessNode, PostParamOptions} from "./_Base";
import {BrightnessContrastShader as BrightnessContrastShader2} from "../../../modules/three/examples/jsm/shaders/BrightnessContrastShader";
import {ShaderPass as ShaderPass2} from "../../../modules/three/examples/jsm/postprocessing/ShaderPass";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class BrightnessContrastPostParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.brightness = ParamConfig.FLOAT(0, {
      range: [-1, 1],
      range_locked: [false, false],
      ...PostParamOptions
    });
    this.contrast = ParamConfig.FLOAT(0, {
      range: [-1, 1],
      range_locked: [false, false],
      ...PostParamOptions
    });
    this.transparent = ParamConfig.BOOLEAN(1, PostParamOptions);
  }
}
const ParamsConfig2 = new BrightnessContrastPostParamsConfig();
export class BrightnessContrastPostNode extends TypedPostProcessNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "brightness_contrast";
  }
  _create_pass(context) {
    const pass = new ShaderPass2(BrightnessContrastShader2);
    console.log("brightness", pass);
    pass.fsQuad.material.transparent = true;
    this.update_pass(pass);
    return pass;
  }
  update_pass(pass) {
    pass.uniforms.brightness.value = this.pv.brightness;
    pass.uniforms.contrast.value = this.pv.contrast;
    pass.material.transparent = this.pv.transparent;
  }
}

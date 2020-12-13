import {TypedPostProcessNode, PostParamOptions} from "./_Base";
import {FXAAShader as FXAAShader2} from "../../../modules/three/examples/jsm/shaders/FXAAShader";
import {ShaderPass as ShaderPass2} from "../../../modules/three/examples/jsm/postprocessing/ShaderPass";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class FXAAPostParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.transparent = ParamConfig.BOOLEAN(1, PostParamOptions);
  }
}
const ParamsConfig2 = new FXAAPostParamsConfig();
export class FXAAPostNode extends TypedPostProcessNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "fxaa";
  }
  _create_pass(context) {
    const pass = new ShaderPass2(FXAAShader2);
    pass.uniforms.resolution.value.set(1 / context.resolution.x, 1 / context.resolution.y);
    pass.material.transparent = true;
    this.update_pass(pass);
    return pass;
  }
  update_pass(pass) {
    pass.material.transparent = this.pv.transparent;
  }
}

import {DirectionalLight as DirectionalLight2} from "three/src/lights/DirectionalLight";
import {DirectionalLightHelper as DirectionalLightHelper2} from "./utils/helpers/DirectionalLightHelper";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {HelperController as HelperController2} from "./utils/HelperController";
import {BaseLightTransformedObjNode} from "./_BaseLightTransformed";
import {TransformedParamConfig} from "./utils/TransformController";
import {ColorConversion} from "../../../core/Color";
export function DirectionalLightParamConfig(Base) {
  return class Mixin extends Base {
    constructor() {
      super(...arguments);
      this.light = ParamConfig.FOLDER();
      this.color = ParamConfig.COLOR([1, 1, 1], {
        conversion: ColorConversion.SRGB_TO_LINEAR
      });
      this.intensity = ParamConfig.FLOAT(1);
      this.distance = ParamConfig.FLOAT(100, {range: [0, 100]});
      this.cast_shadows = ParamConfig.BOOLEAN(1);
      this.shadow_res = ParamConfig.VECTOR2([1024, 1024]);
      this.shadow_bias = ParamConfig.FLOAT(1e-3);
      this.show_helper = ParamConfig.BOOLEAN(1);
      this.helper_size = ParamConfig.FLOAT(1, {visible_if: {show_helper: 1}});
    }
  };
}
class DirectionalLightObjParamsConfig extends DirectionalLightParamConfig(TransformedParamConfig(NodeParamsConfig)) {
}
const ParamsConfig2 = new DirectionalLightObjParamsConfig();
export class DirectionalLightObjNode extends BaseLightTransformedObjNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this._helper_controller = new HelperController2(this, DirectionalLightHelper2, "DirectionalLightHelper");
  }
  static type() {
    return "directional_light";
  }
  initialize_node() {
    this._helper_controller.initialize_node();
  }
  create_light() {
    const light = new DirectionalLight2();
    light.matrixAutoUpdate = false;
    light.castShadow = true;
    light.shadow.bias = -1e-3;
    light.shadow.mapSize.x = 1024;
    light.shadow.mapSize.y = 1024;
    light.shadow.camera.near = 0.1;
    this._target_target = light.target;
    this._target_target.name = "DirectionalLight Default Target";
    this.object.add(this._target_target);
    return light;
  }
  update_light_params() {
    this.light.color = this.pv.color;
    this.light.intensity = this.pv.intensity;
    this.light.shadow.camera.far = this.pv.distance;
    this._helper_controller.update();
  }
  update_shadow_params() {
    this.light.castShadow = this.pv.cast_shadows;
    this.light.shadow.mapSize.copy(this.pv.shadow_res);
    this.light.shadow.bias = this.pv.shadow_bias;
    this.light.shadow.camera.updateProjectionMatrix();
  }
}

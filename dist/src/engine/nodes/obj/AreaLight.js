import {RectAreaLight as RectAreaLight2} from "three/src/lights/RectAreaLight";
import {RectAreaLightUniformsLib as RectAreaLightUniformsLib2} from "../../../modules/three/examples/jsm/lights/RectAreaLightUniformsLib";
import {BaseLightTransformedObjNode} from "./_BaseLightTransformed";
import {TransformedParamConfig} from "./utils/TransformController";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {ColorConversion} from "../../../core/Color";
export function AreaLightParamConfig(Base) {
  return class Mixin extends Base {
    constructor() {
      super(...arguments);
      this.color = ParamConfig.COLOR([1, 1, 1], {
        conversion: ColorConversion.SRGB_TO_LINEAR
      });
      this.intensity = ParamConfig.FLOAT(1, {range: [0, 10]});
      this.width = ParamConfig.FLOAT(1, {range: [0, 10]});
      this.height = ParamConfig.FLOAT(1, {range: [0, 10]});
    }
  };
}
class AreaLightObjParamsConfig extends AreaLightParamConfig(TransformedParamConfig(NodeParamsConfig)) {
}
const ParamsConfig2 = new AreaLightObjParamsConfig();
export class AreaLightObjNode extends BaseLightTransformedObjNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "area_light";
  }
  create_light() {
    const light = new RectAreaLight2(16777215, 1, 1, 1);
    light.matrixAutoUpdate = false;
    return light;
  }
  update_light_params() {
    this.light.color = this.pv.color;
    this.light.intensity = this.pv.intensity;
    this.light.width = this.pv.width;
    this.light.height = this.pv.height;
  }
  async cook() {
    if (!RectAreaLightUniformsLib2.initialized) {
      RectAreaLightUniformsLib2.init();
      RectAreaLightUniformsLib2.initialized = true;
    }
    this.transform_controller.update();
    this.update_light_params();
    this.update_shadow_params();
    this.cook_controller.end_cook();
  }
}

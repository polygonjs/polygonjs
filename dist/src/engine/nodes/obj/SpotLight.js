import {SpotLight as SpotLight2} from "three/src/lights/SpotLight";
import {BaseLightTransformedObjNode} from "./_BaseLightTransformed";
import {TransformedParamConfig} from "./utils/TransformController";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {HelperController as HelperController2} from "./utils/HelperController";
import {SpotLightHelper as SpotLightHelper2} from "./utils/helpers/SpotLightHelper";
import {ColorConversion} from "../../../core/Color";
class SpotLightObjParamsConfig extends TransformedParamConfig(NodeParamsConfig) {
  constructor() {
    super(...arguments);
    this.light = ParamConfig.FOLDER();
    this.color = ParamConfig.COLOR([1, 1, 1], {
      conversion: ColorConversion.SRGB_TO_LINEAR
    });
    this.intensity = ParamConfig.FLOAT(1);
    this.angle = ParamConfig.FLOAT(45, {range: [0, 180]});
    this.penumbra = ParamConfig.FLOAT(0.1);
    this.decay = ParamConfig.FLOAT(0.1, {range: [0, 1]});
    this.distance = ParamConfig.FLOAT(100, {range: [0, 100]});
    this.cast_shadows = ParamConfig.BOOLEAN(1);
    this.shadow_res = ParamConfig.VECTOR2([1024, 1024], {
      visible_if: {cast_shadows: 1}
    });
    this.shadow_bias = ParamConfig.FLOAT(1e-3, {
      visible_if: {cast_shadows: 1},
      range: [-0.01, 0.01],
      range_locked: [false, false]
    });
    this.show_helper = ParamConfig.BOOLEAN(1);
    this.helper_size = ParamConfig.FLOAT(1, {visible_if: {show_helper: 1}});
  }
}
const ParamsConfig2 = new SpotLightObjParamsConfig();
export class SpotLightObjNode extends BaseLightTransformedObjNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this._helper_controller = new HelperController2(this, SpotLightHelper2, "SpotLightHelper");
  }
  static type() {
    return "spot_light";
  }
  initialize_node() {
    this._helper_controller.initialize_node();
  }
  create_light() {
    const light = new SpotLight2();
    light.matrixAutoUpdate = false;
    light.castShadow = true;
    light.shadow.bias = -1e-3;
    light.shadow.mapSize.x = 1024;
    light.shadow.mapSize.y = 1024;
    light.shadow.camera.near = 0.1;
    this._target_target = light.target;
    this._target_target.name = "SpotLight Default Target";
    this._target_target.matrixAutoUpdate = false;
    this.object.add(this._target_target);
    return light;
  }
  update_light_params() {
    this.light.color = this.pv.color;
    this.light.intensity = this.pv.intensity;
    this.light.angle = this.pv.angle * (Math.PI / 180);
    this.light.penumbra = this.pv.penumbra;
    this.light.decay = this.pv.decay;
    this.light.distance = this.pv.distance;
    this._helper_controller.update();
  }
  update_shadow_params() {
    this.light.castShadow = this.pv.cast_shadows;
    this.light.shadow.mapSize.copy(this.pv.shadow_res);
    this.light.shadow.bias = this.pv.shadow_bias;
  }
}

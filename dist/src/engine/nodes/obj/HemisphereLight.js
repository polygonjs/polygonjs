import {HemisphereLight as HemisphereLight2} from "three/src/lights/HemisphereLight";
import {HemisphereLightHelper as HemisphereLightHelper2} from "./utils/helpers/HemisphereLightHelper";
import {TypedLightObjNode} from "./_BaseLight";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {HelperController as HelperController2} from "./utils/HelperController";
import {ColorConversion} from "../../../core/Color";
class HemisphereLightObjParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.sky_color = ParamConfig.COLOR([0.5, 0.9, 1], {
      conversion: ColorConversion.SRGB_TO_LINEAR
    });
    this.ground_color = ParamConfig.COLOR([0.1, 0.15, 0.1], {
      conversion: ColorConversion.SRGB_TO_LINEAR
    });
    this.intensity = ParamConfig.FLOAT(1);
    this.position = ParamConfig.VECTOR3([0, 1, 0]);
    this.show_helper = ParamConfig.BOOLEAN(0);
    this.helper_size = ParamConfig.FLOAT(1, {visible_if: {show_helper: 1}});
  }
}
const ParamsConfig2 = new HemisphereLightObjParamsConfig();
export class HemisphereLightObjNode extends TypedLightObjNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this._helper_controller = new HelperController2(this, HemisphereLightHelper2, "HemisphereLightHelper");
  }
  static type() {
    return "hemisphere_light";
  }
  create_light() {
    const light = new HemisphereLight2();
    light.matrixAutoUpdate = false;
    return light;
  }
  initialize_node() {
    this.io.inputs.set_count(0, 1);
    this._helper_controller.initialize_node();
  }
  update_light_params() {
    this.light.color = this.pv.sky_color;
    this.light.groundColor = this.pv.ground_color;
    this.light.position.copy(this.pv.position);
    this.light.intensity = this.pv.intensity;
    this._helper_controller.update();
  }
}

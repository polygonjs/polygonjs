import {LineBasicMaterial as LineBasicMaterial2} from "three/src/materials/LineBasicMaterial";
import {TypedMatNode} from "./_Base";
import {DepthController as DepthController2, DepthParamConfig} from "./utils/DepthController";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class LineBasicMatParamsConfig extends DepthParamConfig(NodeParamsConfig) {
  constructor() {
    super(...arguments);
    this.color = ParamConfig.COLOR([1, 1, 1]);
    this.line_width = ParamConfig.FLOAT(1, {
      range: [1, 10],
      range_locked: [true, false]
    });
  }
}
const ParamsConfig2 = new LineBasicMatParamsConfig();
export class LineBasicMatNode extends TypedMatNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this.depth_controller = new DepthController2(this);
  }
  static type() {
    return "line_basic";
  }
  create_material() {
    return new LineBasicMaterial2({
      color: 16777215,
      linewidth: 1
    });
  }
  initialize_node() {
  }
  async cook() {
    this.material.color.copy(this.pv.color);
    this.material.linewidth = this.pv.line_width;
    this.depth_controller.update();
    this.set_material(this.material);
  }
}

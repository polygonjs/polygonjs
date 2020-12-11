const PARAM_NAME = "layer";
import {ParamConfig} from "../../utils/params/ParamsConfig";
export function LayerParamConfig(Base2) {
  return class Mixin extends Base2 {
    constructor() {
      super(...arguments);
      this.layer = ParamConfig.INTEGER(0, {
        range: [0, 31],
        range_locked: [true, true]
      });
    }
  };
}
export class LayersController {
  constructor(node) {
    this.node = node;
  }
  update() {
    const object = this.node.object;
    object.layers.set(0);
    object.layers.enable(this.node.params.integer(PARAM_NAME));
  }
}

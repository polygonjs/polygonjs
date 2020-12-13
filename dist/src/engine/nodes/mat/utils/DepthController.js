import {TypedMatNode} from "../_Base";
import {BaseController as BaseController2} from "./_BaseController";
import {NodeParamsConfig, ParamConfig} from "../../utils/params/ParamsConfig";
export function DepthParamConfig(Base4) {
  return class Mixin extends Base4 {
    constructor() {
      super(...arguments);
      this.depth_write = ParamConfig.BOOLEAN(1, {
        cook: false,
        callback: (node, param) => {
          DepthController.update(node);
        }
      });
      this.depth_test = ParamConfig.BOOLEAN(1, {
        cook: false,
        callback: (node, param) => {
          DepthController.update(node);
        }
      });
    }
  };
}
class DepthParamsConfig extends DepthParamConfig(NodeParamsConfig) {
}
class DepthMapMatNode extends TypedMatNode {
}
export class DepthController extends BaseController2 {
  constructor(node) {
    super(node);
    this.node = node;
  }
  async update() {
    this.node.material.depthWrite = this.node.pv.depth_write;
    this.node.material.depthTest = this.node.pv.depth_test;
  }
  static async update(node) {
    node.depth_controller.update();
  }
}

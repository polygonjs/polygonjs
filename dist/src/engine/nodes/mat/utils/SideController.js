import {BaseController as BaseController2} from "./_BaseController";
import {FrontSide} from "three/src/constants";
import {DoubleSide} from "three/src/constants";
import {BackSide} from "three/src/constants";
import {Material as Material2} from "three/src/materials/Material";
import {TypedMatNode} from "../_Base";
import {NodeParamsConfig, ParamConfig} from "../../utils/params/ParamsConfig";
export function SideParamConfig(Base2) {
  return class Mixin extends Base2 {
    constructor() {
      super(...arguments);
      this.double_sided = ParamConfig.BOOLEAN(0);
      this.front = ParamConfig.BOOLEAN(1, {visible_if: {double_sided: false}});
    }
  };
}
class SidedMaterial extends Material2 {
}
class SideParamsConfig extends SideParamConfig(NodeParamsConfig) {
}
class SideMatNode extends TypedMatNode {
  create_material() {
    return new SidedMaterial();
  }
}
export class SideController extends BaseController2 {
  constructor(node) {
    super(node);
    this.node = node;
  }
  static update(node) {
    const single_side = node.pv.front ? FrontSide : BackSide;
    const new_side = node.pv.double_sided ? DoubleSide : single_side;
    if (new_side != node.material.side) {
      node.material.side = new_side;
      node.material.needsUpdate = true;
    }
  }
}

import {BaseController as BaseController2} from "./_BaseController";
import {Material as Material2} from "three/src/materials/Material";
import {NodeParamsConfig, ParamConfig} from "../../utils/params/ParamsConfig";
import {TypedMatNode} from "../_Base";
export function SkinningParamConfig(Base2) {
  return class Mixin extends Base2 {
    constructor() {
      super(...arguments);
      this.skinning = ParamConfig.BOOLEAN(0);
    }
  };
}
class SkinnedMaterial extends Material2 {
}
class SkinningParamsConfig extends SkinningParamConfig(NodeParamsConfig) {
}
class SkinningMatNode extends TypedMatNode {
  create_material() {
    return new SkinnedMaterial();
  }
}
export class SkinningController extends BaseController2 {
  constructor(node) {
    super(node);
    this.node = node;
  }
  static update(node) {
    const new_skinning = node.pv.skinning;
    if (new_skinning != node.material.skinning) {
      node.material.skinning = new_skinning;
      node.material.needsUpdate = true;
    }
  }
}

import {BaseController as BaseController2} from "./_BaseController";
import {TypedMatNode} from "../_Base";
import {Material as Material2} from "three/src/materials/Material";
import {NodeParamsConfig, ParamConfig} from "../../utils/params/ParamsConfig";
export function ColorParamConfig(Base2) {
  return class Mixin extends Base2 {
    constructor() {
      super(...arguments);
      this.transparent = ParamConfig.BOOLEAN(0);
      this.opacity = ParamConfig.FLOAT(1);
      this.alpha_test = ParamConfig.FLOAT(0);
      this.use_fog = ParamConfig.BOOLEAN(0);
    }
  };
}
class ColoredMaterial extends Material2 {
}
class ColorParamsConfig extends ColorParamConfig(NodeParamsConfig) {
}
class ColoredMatNode extends TypedMatNode {
  create_material() {
    return new ColoredMaterial();
  }
}
export class ColorsController extends BaseController2 {
  constructor(node) {
    super(node);
    this.node = node;
  }
  static update(node) {
    const material = node.material;
    const pv = node.pv;
    if (material.uniforms.opacity) {
      material.uniforms.opacity.value = pv.opacity;
    }
    material.transparent = pv.transparent || pv.opacity < 1;
    material.depthTest = true;
    material.alphaTest = pv.alpha_test;
    material.fog = pv.use_fog;
  }
}

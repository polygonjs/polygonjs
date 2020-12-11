import {Mesh as Mesh2} from "three/src/objects/Mesh";
import {MeshBasicMaterial as MeshBasicMaterial2} from "three/src/materials/MeshBasicMaterial";
import {NodeParamsConfig, ParamConfig} from "../../../utils/params/ParamsConfig";
import {TypedObjNode} from "../../_Base";
import {FlagsControllerD} from "../../../utils/FlagsController";
export function BaseLightHelperParamConfig(Base2) {
  return class Mixin extends Base2 {
    constructor() {
      super(...arguments);
      this.show_helper = ParamConfig.BOOLEAN(1);
      this.helper_size = ParamConfig.FLOAT(1, {visible_if: {show_helper: 1}});
    }
  };
}
class BaseLightHelperParamsConfig extends BaseLightHelperParamConfig(NodeParamsConfig) {
}
export class BaseLightHelperObjNode extends TypedObjNode {
  constructor() {
    super(...arguments);
    this.flags = new FlagsControllerD(this);
  }
}
export class BaseLightHelper {
  constructor(node, _name) {
    this.node = node;
    this._name = _name;
    this._object = new Mesh2();
    this._material = new MeshBasicMaterial2({wireframe: true, fog: false});
  }
  build() {
    this._object.matrixAutoUpdate = false;
    this._object.name = this._name;
    this.build_helper();
  }
  get object() {
    return this._object;
  }
}

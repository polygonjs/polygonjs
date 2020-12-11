import {Material as Material2} from "three/src/materials/Material";
import {TypedMatNode} from "../_Base";
import {
  BaseTextureMapController,
  BooleanParamOptions,
  OperatorPathOptions
} from "./_BaseTextureController";
import {NodeParamsConfig, ParamConfig} from "../../utils/params/ParamsConfig";
import {OPERATOR_PATH_DEFAULT} from "../../../params/OperatorPath";
export function TextureMapParamConfig(Base2) {
  return class Mixin extends Base2 {
    constructor() {
      super(...arguments);
      this.use_map = ParamConfig.BOOLEAN(0, BooleanParamOptions(TextureMapController));
      this.map = ParamConfig.OPERATOR_PATH(OPERATOR_PATH_DEFAULT.NODE.UV, OperatorPathOptions(TextureMapController, "use_map"));
    }
  };
}
class TextureMapMaterial extends Material2 {
}
class TextureMapParamsConfig extends TextureMapParamConfig(NodeParamsConfig) {
}
class TextureMapMatNode extends TypedMatNode {
}
export class TextureMapController extends BaseTextureMapController {
  constructor(node, _update_options) {
    super(node, _update_options);
    this.node = node;
  }
  initialize_node() {
    this.add_hooks(this.node.p.use_map, this.node.p.map);
  }
  async update() {
    this._update(this.node.material, "map", this.node.p.use_map, this.node.p.map);
  }
  static async update(node) {
    node.texture_map_controller.update();
  }
}

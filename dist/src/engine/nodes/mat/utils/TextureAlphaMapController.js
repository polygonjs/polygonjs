import {Material as Material2} from "three/src/materials/Material";
import {TypedMatNode} from "../_Base";
import {
  BaseTextureMapController,
  BooleanParamOptions,
  OperatorPathOptions
} from "./_BaseTextureController";
import {NodeParamsConfig, ParamConfig} from "../../utils/params/ParamsConfig";
import {OPERATOR_PATH_DEFAULT} from "../../../params/OperatorPath";
export function TextureAlphaMapParamConfig(Base2) {
  return class Mixin extends Base2 {
    constructor() {
      super(...arguments);
      this.use_alpha_map = ParamConfig.BOOLEAN(0, BooleanParamOptions(TextureAlphaMapController));
      this.alpha_map = ParamConfig.OPERATOR_PATH(OPERATOR_PATH_DEFAULT.NODE.UV, OperatorPathOptions(TextureAlphaMapController, "use_alpha_map"));
    }
  };
}
class TextureAlphaMaterial extends Material2 {
}
class TextureAlphaMapParamsConfig extends TextureAlphaMapParamConfig(NodeParamsConfig) {
}
class TextureAlphaMapMatNode extends TypedMatNode {
}
export class TextureAlphaMapController extends BaseTextureMapController {
  constructor(node, _update_options) {
    super(node, _update_options);
    this.node = node;
  }
  initialize_node() {
    this.add_hooks(this.node.p.use_alpha_map, this.node.p.alpha_map);
  }
  async update() {
    this._update(this.node.material, "alphaMap", this.node.p.use_alpha_map, this.node.p.alpha_map);
  }
  static async update(node) {
    node.texture_alpha_map_controller.update();
  }
}

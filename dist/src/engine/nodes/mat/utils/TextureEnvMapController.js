import {Material as Material2} from "three/src/materials/Material";
import {TypedMatNode} from "../_Base";
import {
  BaseTextureMapController,
  BooleanParamOptions,
  OperatorPathOptions
} from "./_BaseTextureController";
import {NodeParamsConfig, ParamConfig} from "../../utils/params/ParamsConfig";
import {OPERATOR_PATH_DEFAULT} from "../../../params/OperatorPath";
export function TextureEnvMapParamConfig(Base2) {
  return class Mixin extends Base2 {
    constructor() {
      super(...arguments);
      this.use_env_map = ParamConfig.BOOLEAN(0, BooleanParamOptions(TextureEnvMapController));
      this.env_map = ParamConfig.OPERATOR_PATH(OPERATOR_PATH_DEFAULT.NODE.ENV_MAP, OperatorPathOptions(TextureEnvMapController, "use_env_map"));
      this.env_map_intensity = ParamConfig.FLOAT(1, {visible_if: {use_env_map: 1}});
    }
  };
}
class TextureEnvMaterial extends Material2 {
}
class TextureEnvMapParamsConfig extends TextureEnvMapParamConfig(NodeParamsConfig) {
}
class TextureEnvMapMatNode extends TypedMatNode {
}
export class TextureEnvMapController extends BaseTextureMapController {
  constructor(node, _update_options) {
    super(node, _update_options);
    this.node = node;
  }
  initialize_node() {
    this.add_hooks(this.node.p.use_env_map, this.node.p.env_map);
  }
  async update() {
    this._update(this.node.material, "envMap", this.node.p.use_env_map, this.node.p.env_map);
  }
  static async update(node) {
    node.texture_env_map_controller.update();
  }
}

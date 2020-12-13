import {TypedCopNode} from "./_Base";
import {InputCloneMode as InputCloneMode2} from "../../poly/InputCloneMode";
import {TextureParamsController as TextureParamsController2, TextureParamConfig} from "./utils/TextureParamsController";
import {NodeParamsConfig} from "../utils/params/ParamsConfig";
class TexturePropertiesCopParamsConfig extends TextureParamConfig(NodeParamsConfig) {
}
const ParamsConfig2 = new TexturePropertiesCopParamsConfig();
export class TexturePropertiesCopNode extends TypedCopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this.texture_params_controller = new TextureParamsController2(this);
  }
  static type() {
    return "texture_properties";
  }
  initialize_node() {
    this.io.inputs.set_count(1);
    this.io.inputs.init_inputs_cloned_state([InputCloneMode2.FROM_NODE]);
  }
  async cook(input_contents) {
    const texture = input_contents[0];
    this.texture_params_controller.update(texture);
    this.set_texture(texture);
  }
}

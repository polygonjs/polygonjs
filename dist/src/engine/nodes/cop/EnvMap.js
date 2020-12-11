import {PMREMGenerator as PMREMGenerator2} from "three/src/extras/PMREMGenerator";
import {TypedCopNode} from "./_Base";
import {InputCloneMode as InputCloneMode2} from "../../poly/InputCloneMode";
import {DataTextureController as DataTextureController2, DataTextureControllerBufferType} from "./utils/DataTextureController";
import {CopRendererController} from "./utils/RendererController";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class EnvMapCopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.use_camera_renderer = ParamConfig.BOOLEAN(0);
  }
}
const ParamsConfig2 = new EnvMapCopParamsConfig();
export class EnvMapCopNode extends TypedCopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "env_map";
  }
  initialize_node() {
    this.io.inputs.set_count(1);
    this.io.inputs.init_inputs_cloned_state(InputCloneMode2.NEVER);
  }
  async cook(input_contents) {
    const texture = input_contents[0];
    this.convert_texture_to_env_map(texture);
  }
  async convert_texture_to_env_map(input_texture) {
    this._renderer_controller = this._renderer_controller || new CopRendererController(this);
    const renderer = await this._renderer_controller.renderer();
    if (renderer) {
      const pmremGenerator = new PMREMGenerator2(renderer);
      const exrCubeRenderTarget = pmremGenerator.fromEquirectangular(input_texture);
      if (this.pv.use_camera_renderer) {
        this.set_texture(exrCubeRenderTarget.texture);
      } else {
        this._data_texture_controller = this._data_texture_controller || new DataTextureController2(DataTextureControllerBufferType.Uint8Array);
        const texture = this._data_texture_controller.from_render_target(renderer, exrCubeRenderTarget);
        this.set_texture(texture);
      }
    } else {
      this.states.error.set("no renderer found to convert the texture to an env map");
      this.cook_controller.end_cook();
    }
  }
}

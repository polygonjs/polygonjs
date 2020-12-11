import {TypedCopNode} from "./_Base";
import {CoreTextureLoader} from "../../../core/loader/Texture";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {DesktopFileType} from "../../params/utils/OptionsController";
import {TextureParamsController as TextureParamsController2, TextureParamConfig} from "./utils/TextureParamsController";
import {CopFileTypeController} from "./utils/FileTypeController";
export function ImageCopParamConfig(Base4) {
  return class Mixin extends Base4 {
    constructor() {
      super(...arguments);
      this.url = ParamConfig.STRING(CoreTextureLoader.PARAM_DEFAULT, {
        desktop_browse: {file_type: DesktopFileType.TEXTURE},
        asset_reference: true
      });
      this.reload = ParamConfig.BUTTON(null, {
        callback: (node, param) => {
          ImageCopNode.PARAM_CALLBACK_reload(node, param);
        }
      });
    }
  };
}
class ImageCopParamsConfig extends TextureParamConfig(ImageCopParamConfig(NodeParamsConfig)) {
}
const ParamsConfig2 = new ImageCopParamsConfig();
export class ImageCopNode extends TypedCopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this.texture_params_controller = new TextureParamsController2(this);
  }
  static type() {
    return "image";
  }
  async required_modules() {
    if (this.p.url.is_dirty) {
      await this.p.url.compute();
    }
    const ext = CoreTextureLoader.get_extension(this.pv.url || "");
    return CoreTextureLoader.module_names(ext);
  }
  initialize_node() {
    this.scene.dispatch_controller.on_add_listener(() => {
      this.params.on_params_created("params_label", () => {
        this.params.label.init([this.p.url], () => {
          const url = this.pv.url;
          if (url) {
            const elements = url.split("/");
            return elements[elements.length - 1];
          } else {
            return "";
          }
        });
      });
    });
  }
  async cook() {
    if (CopFileTypeController.is_static_image_url(this.pv.url)) {
      await this.cook_for_image();
    } else {
      this.states.error.set("input is not an image");
    }
  }
  async cook_for_image() {
    const texture = await this._load_texture(this.pv.url);
    if (texture) {
      this.texture_params_controller.update(texture);
      this.set_texture(texture);
    } else {
      this.clear_texture();
    }
  }
  resolved_url() {
    return this.pv.url;
  }
  static PARAM_CALLBACK_reload(node, param) {
    node.param_callback_reload();
  }
  param_callback_reload() {
    this.p.url.set_dirty();
  }
  async _load_texture(url) {
    let texture = null;
    const url_param = this.p.url;
    this._texture_loader = this._texture_loader || new CoreTextureLoader(this, url_param);
    try {
      texture = await this._texture_loader.load_texture_from_url_or_op(url);
      if (texture) {
        texture.matrixAutoUpdate = false;
      }
    } catch (e) {
    }
    if (!texture) {
      this.states.error.set(`could not load texture '${url}'`);
    }
    return texture;
  }
}

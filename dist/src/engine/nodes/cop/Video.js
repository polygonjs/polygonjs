import {TypedCopNode} from "./_Base";
import {CoreTextureLoader} from "../../../core/loader/Texture";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {DesktopFileType} from "../../params/utils/OptionsController";
import {CopFileTypeController} from "./utils/FileTypeController";
import {TextureParamsController as TextureParamsController2, TextureParamConfig} from "./utils/TextureParamsController";
export function VideoCopParamConfig(Base4) {
  return class Mixin extends Base4 {
    constructor() {
      super(...arguments);
      this.url = ParamConfig.STRING(CoreTextureLoader.PARAM_DEFAULT, {
        desktop_browse: {file_type: DesktopFileType.TEXTURE},
        asset_reference: true
      });
      this.reload = ParamConfig.BUTTON(null, {
        callback: (node, param) => {
          VideoCopNode.PARAM_CALLBACK_reload(node, param);
        }
      });
      this.play = ParamConfig.BOOLEAN(1, {
        cook: false,
        callback: (node) => {
          VideoCopNode.PARAM_CALLBACK_video_update_play(node);
        }
      });
      this.muted = ParamConfig.BOOLEAN(1, {
        cook: false,
        callback: (node) => {
          VideoCopNode.PARAM_CALLBACK_video_update_muted(node);
        }
      });
      this.loop = ParamConfig.BOOLEAN(1, {
        cook: false,
        callback: (node) => {
          VideoCopNode.PARAM_CALLBACK_video_update_loop(node);
        }
      });
      this.video_time = ParamConfig.FLOAT(0, {
        cook: false
      });
      this.set_video_time = ParamConfig.BUTTON(null, {
        cook: false,
        callback: (node) => {
          VideoCopNode.PARAM_CALLBACK_video_update_time(node);
        }
      });
    }
  };
}
class VideoCopParamsConfig extends TextureParamConfig(VideoCopParamConfig(NodeParamsConfig)) {
}
const ParamsConfig2 = new VideoCopParamsConfig();
export class VideoCopNode extends TypedCopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this.texture_params_controller = new TextureParamsController2(this);
  }
  static type() {
    return "video";
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
      this.states.error.set("input is not a video");
    } else {
      await this.cook_for_video();
    }
  }
  async cook_for_video() {
    const texture = await this._load_texture(this.pv.url);
    if (texture) {
      this._video = texture.image;
      this.video_update_loop();
      this.video_update_muted();
      this.video_update_play();
      this.video_update_time();
      this.texture_params_controller.update(texture);
      this.set_texture(texture);
    } else {
      this.cook_controller.end_cook();
    }
  }
  resolved_url() {
    return this.pv.url;
  }
  static PARAM_CALLBACK_video_update_time(node) {
    node.video_update_time();
  }
  static PARAM_CALLBACK_video_update_play(node) {
    node.video_update_play();
  }
  static PARAM_CALLBACK_video_update_muted(node) {
    node.video_update_muted();
  }
  static PARAM_CALLBACK_video_update_loop(node) {
    node.video_update_loop();
  }
  async video_update_time() {
    if (this._video) {
      const param = this.p.video_time;
      if (param.is_dirty) {
        await param.compute();
      }
      this._video.currentTime = param.value;
    }
  }
  video_update_muted() {
    if (this._video) {
      this._video.muted = this.pv.muted;
    }
  }
  video_update_loop() {
    if (this._video) {
      this._video.loop = this.pv.loop;
    }
  }
  video_update_play() {
    if (this._video) {
      if (this.pv.play) {
        this._video.play();
      } else {
        this._video.pause();
      }
    }
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

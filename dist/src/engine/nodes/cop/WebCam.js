import {TypedCopNode} from "./_Base";
import {VideoTexture as VideoTexture2} from "three/src/textures/VideoTexture";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {TextureParamsController as TextureParamsController2, TextureParamConfig} from "./utils/TextureParamsController";
export function WebcamCopParamConfig(Base2) {
  return class Mixin extends Base2 {
    constructor() {
      super(...arguments);
      this.res = ParamConfig.VECTOR2([1024, 1024]);
    }
  };
}
class WebCamCopParamsConfig extends TextureParamConfig(WebcamCopParamConfig(NodeParamsConfig)) {
}
const ParamsConfig2 = new WebCamCopParamsConfig();
export class WebCamCopNode extends TypedCopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this.texture_params_controller = new TextureParamsController2(this);
  }
  static type() {
    return "web_cam";
  }
  async cook() {
    if (this._video) {
      document.body.removeChild(this._video);
    }
    const video_element = '<video style="display:none" autoplay muted playsinline></video>';
    const video_container = document.createElement("div");
    video_container.innerHTML = video_element;
    this._video = video_container.children[0];
    document.body.appendChild(video_container);
    const texture = new VideoTexture2(this._video);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const constraints = {video: {width: this.pv.res.x, height: this.pv.res.y, facingMode: "user"}};
      navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        if (!this._video) {
          return;
        }
        this._video.srcObject = stream;
        this._video.play();
        this.set_texture(texture);
      }).catch((error) => {
        this.states.error.set("Unable to access the camera/webcam");
      });
    } else {
      this.states.error.set("MediaDevices interface not available.");
    }
  }
}

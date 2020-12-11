import {TypedCopNode} from "./_Base";
import {DataTexture as DataTexture2} from "three/src/textures/DataTexture";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class ColorCopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.resolution = ParamConfig.VECTOR2([256, 256], {
      callback: (node) => {
        ColorCopNode.PARAM_CALLBACK_reset(node);
      }
    });
    this.color = ParamConfig.COLOR([1, 1, 1]);
  }
}
const ParamsConfig2 = new ColorCopParamsConfig();
export class ColorCopNode extends TypedCopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "color";
  }
  cook() {
    const w = this.pv.resolution.x;
    const h = this.pv.resolution.y;
    this._data_texture = this._data_texture || this._create_data_texture(w, h);
    const pixels_count = h * w;
    const c = this.pv.color.toArray();
    const r = c[0] * 255;
    const g = c[1] * 255;
    const b = c[2] * 255;
    const a = 255;
    const data = this._data_texture.image.data;
    for (let i = 0; i < pixels_count; i++) {
      data[i * 4 + 0] = r;
      data[i * 4 + 1] = g;
      data[i * 4 + 2] = b;
      data[i * 4 + 3] = a;
    }
    this._data_texture.needsUpdate = true;
    this.set_texture(this._data_texture);
  }
  _create_data_texture(width, height) {
    const pixel_buffer = this._create_pixel_buffer(width, height);
    return new DataTexture2(pixel_buffer, width, height);
  }
  _create_pixel_buffer(width, height) {
    const size = width * height * 4;
    return new Uint8Array(size);
  }
  static PARAM_CALLBACK_reset(node) {
    node._reset();
  }
  _reset() {
    this._data_texture = void 0;
  }
}

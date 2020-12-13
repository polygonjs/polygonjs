import {
  LinearFilter,
  FloatType,
  RGBFormat
} from "three/src/constants";
import {DataTexture as DataTexture2} from "three/src/textures/DataTexture";
import {TypedCopNode} from "./_Base";
import {CoreTextureLoader} from "../../../core/loader/Texture";
import {CoreMapboxUtils} from "../../../core/mapbox/Utils";
import {CoreImage} from "../../../core/Image";
import {CoreMapboxClient} from "../../../core/mapbox/Client";
export var TileType;
(function(TileType2) {
  TileType2["ELEVATION"] = "elevation";
  TileType2["SATELLITE"] = "satellite";
})(TileType || (TileType = {}));
const TILE_TYPES = [TileType.ELEVATION, TileType.SATELLITE];
export var TileRes;
(function(TileRes2) {
  TileRes2[TileRes2["LOW"] = 256] = "LOW";
  TileRes2[TileRes2["HIGH"] = 512] = "HIGH";
})(TileRes || (TileRes = {}));
const ROOT_URL = "https://api.mapbox.com/v4";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class MapboxTileCopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.lng_lat = ParamConfig.VECTOR2([-119.63, 37.73311]);
    this.zoom = ParamConfig.INTEGER(12, {
      range: [1, 24],
      range_locked: [true, true]
    });
    this.type = ParamConfig.INTEGER(0, {
      menu: {
        entries: TILE_TYPES.map((m) => ({
          name: m,
          value: TILE_TYPES.indexOf(m)
        }))
      }
    });
  }
}
const ParamsConfig2 = new MapboxTileCopParamsConfig();
export class MapboxTileCopNode extends TypedCopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this._param_hires = true;
    this._texture = new DataTexture2(new Float32Array(3 * 512 * 512), 512, 512, RGBFormat, FloatType);
  }
  static type() {
    return "mapbox_tile";
  }
  initialize_node() {
    this._texture.image.data.fill(255);
    this._texture.minFilter = LinearFilter;
    this._texture.magFilter = LinearFilter;
    this._texture.flipY = true;
  }
  async cook() {
    this._texture_loader = this._texture_loader || new CoreTextureLoader(this, this.p.lng_lat);
    const type = TILE_TYPES[this.pv.type];
    switch (type) {
      case TileType.ELEVATION: {
        await this._cook_for_elevation();
        break;
      }
      case TileType.SATELLITE: {
        await this._cook_for_satellite();
        break;
      }
    }
    this._texture.needsUpdate = true;
    this.set_texture(this._texture);
  }
  async _cook_for_elevation() {
    const url = await this._url("mapbox.terrain-rgb");
    const image_data_rgba = await CoreImage.data_from_url(url);
    const data_rgba = image_data_rgba.data;
    const pixels_count = image_data_rgba.width * image_data_rgba.height;
    let src_stride, dest_stride;
    const dest_data = this._texture.image.data;
    if (this._param_hires) {
      let elevation, R, G, B;
      for (let i = 0; i < pixels_count; i++) {
        src_stride = i * 4;
        dest_stride = i * 3;
        R = data_rgba[src_stride + 0];
        G = data_rgba[src_stride + 1];
        B = data_rgba[src_stride + 2];
        elevation = (R * 256 * 256 + G * 256 + B) * 0.1 / (256 * 256);
        dest_data[dest_stride + 0] = elevation;
        dest_data[dest_stride + 1] = elevation;
        dest_data[dest_stride + 2] = elevation;
      }
    }
  }
  async _cook_for_satellite() {
    const url = await this._url("mapbox.satellite");
    const image_data_rgba = await CoreImage.data_from_url(url);
    const data_rgba = image_data_rgba.data;
    const pixels_count = image_data_rgba.width * image_data_rgba.height;
    let src_stride, dest_stride;
    const dest_data = this._texture.image.data;
    if (this._param_hires) {
      for (let i = 0; i < pixels_count; i++) {
        src_stride = i * 4;
        dest_stride = i * 3;
        dest_data[dest_stride + 0] = data_rgba[src_stride + 0] / 255;
        dest_data[dest_stride + 1] = data_rgba[src_stride + 1] / 255;
        dest_data[dest_stride + 2] = data_rgba[src_stride + 2] / 255;
      }
    } else {
      const resolution = 256;
      for (let i = 0; i < resolution; i++) {
        for (let j = 0; j < resolution; j++) {
          let k = i * resolution + j;
          src_stride = k * 4;
          dest_stride = k * 3;
          dest_data[dest_stride + 0] = data_rgba[src_stride + 0];
          dest_data[dest_stride + 1] = data_rgba[src_stride + 1];
          dest_data[dest_stride + 2] = data_rgba[src_stride + 2];
          k = (i + 1) * resolution + j;
          dest_stride = k * 3;
          dest_data[dest_stride + 0] = data_rgba[src_stride + 0];
          dest_data[dest_stride + 1] = data_rgba[src_stride + 1];
          dest_data[dest_stride + 2] = data_rgba[src_stride + 2];
          k = i * resolution + (j + 1);
          dest_stride = k * 3;
          dest_data[dest_stride + 0] = data_rgba[src_stride + 0];
          dest_data[dest_stride + 1] = data_rgba[src_stride + 1];
          dest_data[dest_stride + 2] = data_rgba[src_stride + 2];
          k = (i + 1) * resolution + (j + 1);
          dest_stride = k * 3;
          dest_data[dest_stride + 0] = data_rgba[src_stride + 0];
          dest_data[dest_stride + 1] = data_rgba[src_stride + 1];
          dest_data[dest_stride + 2] = data_rgba[src_stride + 2];
        }
      }
    }
  }
  async _url(endpoint) {
    const tile_number = CoreMapboxUtils.lnglat_to_tile_number(this.pv.lng_lat.x, this.pv.lng_lat.y, this.pv.zoom);
    const x = tile_number.x;
    const y = tile_number.y;
    const z = this.pv.zoom;
    const res = this._param_hires ? "@2x" : "";
    const token = CoreMapboxClient.token();
    return `${ROOT_URL}/${endpoint}/${z}/${x}/${y}${res}.pngraw?access_token=${token}`;
  }
}

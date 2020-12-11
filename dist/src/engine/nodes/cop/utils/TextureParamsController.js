import {TypedCopNode} from "../_Base";
import {
  UVMapping,
  CubeReflectionMapping,
  CubeRefractionMapping,
  EquirectangularReflectionMapping,
  EquirectangularRefractionMapping,
  CubeUVReflectionMapping,
  CubeUVRefractionMapping,
  ClampToEdgeWrapping,
  RepeatWrapping,
  MirroredRepeatWrapping,
  LinearEncoding,
  sRGBEncoding,
  GammaEncoding,
  RGBEEncoding,
  LogLuvEncoding,
  RGBM7Encoding,
  RGBM16Encoding,
  RGBDEncoding,
  BasicDepthPacking,
  RGBADepthPacking
} from "three/src/constants";
import {
  MAG_FILTER_DEFAULT_VALUE,
  MAG_FILTER_MENU_ENTRIES,
  MIN_FILTER_DEFAULT_VALUE,
  MIN_FILTER_MENU_ENTRIES
} from "../../../../core/cop/ConstantFilter";
const MAPPINGS = [
  {UVMapping},
  {CubeReflectionMapping},
  {CubeRefractionMapping},
  {EquirectangularReflectionMapping},
  {EquirectangularRefractionMapping},
  {CubeUVReflectionMapping},
  {CubeUVRefractionMapping}
];
const ENCODINGS = [
  {LinearEncoding},
  {sRGBEncoding},
  {GammaEncoding},
  {RGBEEncoding},
  {LogLuvEncoding},
  {RGBM7Encoding},
  {RGBM16Encoding},
  {RGBDEncoding},
  {BasicDepthPacking},
  {RGBADepthPacking}
];
const WRAPPINGS = [{ClampToEdgeWrapping}, {RepeatWrapping}, {MirroredRepeatWrapping}];
import {NodeParamsConfig, ParamConfig} from "../../utils/params/ParamsConfig";
import {CopRendererController} from "./RendererController";
export function TextureParamConfig(Base3) {
  return class Mixin extends Base3 {
    constructor() {
      super(...arguments);
      this.tencoding = ParamConfig.BOOLEAN(0);
      this.encoding = ParamConfig.INTEGER(LinearEncoding, {
        visible_if: {tencoding: 1},
        menu: {
          entries: ENCODINGS.map((m) => {
            return {
              name: Object.keys(m)[0],
              value: Object.values(m)[0]
            };
          })
        }
      });
      this.tmapping = ParamConfig.BOOLEAN(0);
      this.mapping = ParamConfig.INTEGER(UVMapping, {
        visible_if: {tmapping: 1},
        menu: {
          entries: MAPPINGS.map((m) => {
            return {
              name: Object.keys(m)[0],
              value: Object.values(m)[0]
            };
          })
        }
      });
      this.twrap = ParamConfig.BOOLEAN(0);
      this.wrap_s = ParamConfig.INTEGER(Object.values(WRAPPINGS[0])[0], {
        visible_if: {twrap: 1},
        menu: {
          entries: WRAPPINGS.map((m) => {
            return {
              name: Object.keys(m)[0],
              value: Object.values(m)[0]
            };
          })
        }
      });
      this.wrap_t = ParamConfig.INTEGER(Object.values(WRAPPINGS[0])[0], {
        visible_if: {twrap: 1},
        menu: {
          entries: WRAPPINGS.map((m) => {
            return {
              name: Object.keys(m)[0],
              value: Object.values(m)[0]
            };
          })
        }
      });
      this.wrap_sep = ParamConfig.SEPARATOR(null, {
        visible_if: {twrap: 1}
      });
      this.tminfilter = ParamConfig.BOOLEAN(0);
      this.min_filter = ParamConfig.INTEGER(MIN_FILTER_DEFAULT_VALUE, {
        visible_if: {tminfilter: 1},
        menu: {
          entries: MIN_FILTER_MENU_ENTRIES
        }
      });
      this.tmagfilter = ParamConfig.BOOLEAN(0);
      this.mag_filter = ParamConfig.INTEGER(MAG_FILTER_DEFAULT_VALUE, {
        visible_if: {tmagfilter: 1},
        menu: {
          entries: MAG_FILTER_MENU_ENTRIES
        }
      });
      this.tanisotropy = ParamConfig.BOOLEAN(0);
      this.use_renderer_max_anisotropy = ParamConfig.BOOLEAN(1, {
        visible_if: {tanisotropy: 1}
      });
      this.anisotropy = ParamConfig.INTEGER(1, {
        visible_if: {tanisotropy: 1, use_renderer_max_anisotropy: 0},
        range: [0, 32],
        range_locked: [true, false]
      });
      this.use_camera_renderer = ParamConfig.BOOLEAN(0, {
        visible_if: {tanisotropy: 1, use_renderer_max_anisotropy: 1}
      });
      this.anisotropy_sep = ParamConfig.SEPARATOR(null, {
        visible_if: {tanisotropy: 1}
      });
      this.tflip_y = ParamConfig.BOOLEAN(0);
      this.flip_y = ParamConfig.BOOLEAN(0, {visible_if: {tflip_y: 1}});
      this.ttransform = ParamConfig.BOOLEAN(0);
      this.offset = ParamConfig.VECTOR2([0, 0], {
        visible_if: {ttransform: 1},
        cook: false,
        callback: (node) => {
          TextureParamsController.PARAM_CALLBACK_update_offset(node);
        }
      });
      this.repeat = ParamConfig.VECTOR2([1, 1], {
        visible_if: {ttransform: 1},
        cook: false,
        callback: (node) => {
          TextureParamsController.PARAM_CALLBACK_update_repeat(node);
        }
      });
      this.rotation = ParamConfig.FLOAT(0, {
        range: [-1, 1],
        visible_if: {ttransform: 1},
        cook: false,
        callback: (node) => {
          TextureParamsController.PARAM_CALLBACK_update_rotation(node);
        }
      });
      this.center = ParamConfig.VECTOR2([0, 0], {
        visible_if: {ttransform: 1},
        cook: false,
        callback: (node) => {
          TextureParamsController.PARAM_CALLBACK_update_center(node);
        }
      });
    }
  };
}
class TextureParamsConfig extends TextureParamConfig(NodeParamsConfig) {
}
const ParamsConfig2 = new TextureParamsConfig();
class TextureCopNode extends TypedCopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this.texture_params_controller = new TextureParamsController(this);
  }
}
export class TextureParamsController {
  constructor(node) {
    this.node = node;
  }
  update(texture) {
    const pv = this.node.pv;
    if (pv.tencoding) {
      texture.encoding = pv.encoding;
    }
    if (pv.tmapping) {
      texture.mapping = pv.mapping;
    }
    if (pv.twrap) {
      texture.wrapS = pv.wrap_s;
      texture.wrapT = pv.wrap_t;
    }
    if (pv.tminfilter) {
      texture.minFilter = pv.min_filter;
    }
    if (pv.tminfilter) {
      texture.magFilter = pv.mag_filter;
    }
    this._update_anisotropy(texture);
    texture.flipY = pv.tflip_y && pv.flip_y;
    this._update_texture_transform(texture);
  }
  async _update_anisotropy(texture) {
    const pv = this.node.pv;
    if (!pv.tanisotropy) {
      return;
    }
    if (pv.use_renderer_max_anisotropy) {
      this._renderer_controller = this._renderer_controller || new CopRendererController(this.node);
      const renderer = await this._renderer_controller.renderer();
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    } else {
      texture.anisotropy = pv.anisotropy;
    }
  }
  _update_texture_transform(texture) {
    if (!this.node.pv.ttransform) {
      return;
    }
    this._update_offset(texture, false);
    this._update_repeat(texture, false);
    this._update_rotation(texture, false);
    this._update_center(texture, false);
    texture.updateMatrix();
  }
  _update_offset(texture, update_matrix) {
    texture.offset.copy(this.node.pv.offset);
    if (update_matrix) {
      texture.updateMatrix();
    }
  }
  _update_repeat(texture, update_matrix) {
    texture.repeat.copy(this.node.pv.repeat);
    if (update_matrix) {
      texture.updateMatrix();
    }
  }
  _update_rotation(texture, update_matrix) {
    texture.rotation = this.node.pv.rotation;
    if (update_matrix) {
      texture.updateMatrix();
    }
  }
  _update_center(texture, update_matrix) {
    texture.center.copy(this.node.pv.center);
    if (update_matrix) {
      texture.updateMatrix();
    }
  }
  static PARAM_CALLBACK_update_offset(node) {
    const texture = node.container_controller.container.texture();
    node.texture_params_controller._update_offset(texture, true);
  }
  static PARAM_CALLBACK_update_repeat(node) {
    const texture = node.container_controller.container.texture();
    node.texture_params_controller._update_repeat(texture, true);
  }
  static PARAM_CALLBACK_update_rotation(node) {
    const texture = node.container_controller.container.texture();
    node.texture_params_controller._update_rotation(texture, true);
  }
  static PARAM_CALLBACK_update_center(node) {
    const texture = node.container_controller.container.texture();
    node.texture_params_controller._update_center(texture, true);
  }
}

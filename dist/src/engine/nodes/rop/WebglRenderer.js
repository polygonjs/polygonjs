import {TypedRopNode} from "./_Base";
import {RopType} from "../../poly/registers/nodes/Rop";
import lodash_isArray from "lodash/isArray";
import {WebGLRenderer as WebGLRenderer2} from "three/src/renderers/WebGLRenderer";
import {
  LinearEncoding,
  sRGBEncoding,
  GammaEncoding,
  RGBEEncoding,
  LogLuvEncoding,
  RGBM7Encoding,
  RGBM16Encoding,
  RGBDEncoding,
  NoToneMapping,
  LinearToneMapping,
  ReinhardToneMapping,
  CineonToneMapping,
  ACESFilmicToneMapping,
  BasicShadowMap,
  PCFShadowMap,
  PCFSoftShadowMap,
  VSMShadowMap
} from "three/src/constants";
var RendererPrecision;
(function(RendererPrecision2) {
  RendererPrecision2["lowp"] = "lowp";
  RendererPrecision2["mediump"] = "mediump";
  RendererPrecision2["highp"] = "highp";
})(RendererPrecision || (RendererPrecision = {}));
var PowerPreference;
(function(PowerPreference2) {
  PowerPreference2["HIGH"] = "high-performance";
  PowerPreference2["LOW"] = "low-power";
  PowerPreference2["DEFAULT"] = "default";
})(PowerPreference || (PowerPreference = {}));
var EncodingName;
(function(EncodingName2) {
  EncodingName2["Linear"] = "Linear";
  EncodingName2["sRGB"] = "sRGB";
  EncodingName2["Gamma"] = "Gamma";
  EncodingName2["RGBE"] = "RGBE";
  EncodingName2["LogLuv"] = "LogLuv";
  EncodingName2["RGBM7"] = "RGBM7";
  EncodingName2["RGBM16"] = "RGBM16";
  EncodingName2["RGBD"] = "RGBD";
})(EncodingName || (EncodingName = {}));
var EncodingValue;
(function(EncodingValue2) {
  EncodingValue2[EncodingValue2["Linear"] = LinearEncoding] = "Linear";
  EncodingValue2[EncodingValue2["sRGB"] = sRGBEncoding] = "sRGB";
  EncodingValue2[EncodingValue2["Gamma"] = GammaEncoding] = "Gamma";
  EncodingValue2[EncodingValue2["RGBE"] = RGBEEncoding] = "RGBE";
  EncodingValue2[EncodingValue2["LogLuv"] = LogLuvEncoding] = "LogLuv";
  EncodingValue2[EncodingValue2["RGBM7"] = RGBM7Encoding] = "RGBM7";
  EncodingValue2[EncodingValue2["RGBM16"] = RGBM16Encoding] = "RGBM16";
  EncodingValue2[EncodingValue2["RGBD"] = RGBDEncoding] = "RGBD";
})(EncodingValue || (EncodingValue = {}));
const ENCODING_NAMES = [
  EncodingName.Linear,
  EncodingName.sRGB,
  EncodingName.Gamma,
  EncodingName.RGBE,
  EncodingName.LogLuv,
  EncodingName.RGBM7,
  EncodingName.RGBM16,
  EncodingName.RGBD
];
const ENCODING_VALUES = [
  EncodingValue.Linear,
  EncodingValue.sRGB,
  EncodingValue.Gamma,
  EncodingValue.RGBE,
  EncodingValue.LogLuv,
  EncodingValue.RGBM7,
  EncodingValue.RGBM16,
  EncodingValue.RGBD
];
export const DEFAULT_OUTPUT_ENCODING = EncodingValue.sRGB;
var ToneMappingName;
(function(ToneMappingName2) {
  ToneMappingName2["No"] = "No";
  ToneMappingName2["Linear"] = "Linear";
  ToneMappingName2["Reinhard"] = "Reinhard";
  ToneMappingName2["Cineon"] = "Cineon";
  ToneMappingName2["ACESFilmic"] = "ACESFilmic";
})(ToneMappingName || (ToneMappingName = {}));
var ToneMappingValue;
(function(ToneMappingValue2) {
  ToneMappingValue2[ToneMappingValue2["No"] = NoToneMapping] = "No";
  ToneMappingValue2[ToneMappingValue2["Linear"] = LinearToneMapping] = "Linear";
  ToneMappingValue2[ToneMappingValue2["Reinhard"] = ReinhardToneMapping] = "Reinhard";
  ToneMappingValue2[ToneMappingValue2["Cineon"] = CineonToneMapping] = "Cineon";
  ToneMappingValue2[ToneMappingValue2["ACESFilmic"] = ACESFilmicToneMapping] = "ACESFilmic";
})(ToneMappingValue || (ToneMappingValue = {}));
const TONE_MAPPING_NAMES = [
  ToneMappingName.No,
  ToneMappingName.Linear,
  ToneMappingName.Reinhard,
  ToneMappingName.Cineon,
  ToneMappingName.ACESFilmic
];
const TONE_MAPPING_VALUES = [
  ToneMappingValue.No,
  ToneMappingValue.Linear,
  ToneMappingValue.Reinhard,
  ToneMappingValue.Cineon,
  ToneMappingValue.ACESFilmic
];
export const DEFAULT_TONE_MAPPING = ToneMappingValue.ACESFilmic;
const TONE_MAPPING_MENU_ENTRIES = TONE_MAPPING_NAMES.map((name, i) => {
  return {
    name,
    value: TONE_MAPPING_VALUES[i]
  };
});
var ShadowMapTypeName;
(function(ShadowMapTypeName2) {
  ShadowMapTypeName2["Basic"] = "Basic";
  ShadowMapTypeName2["PCF"] = "PCF";
  ShadowMapTypeName2["PCFSoft"] = "PCFSoft";
  ShadowMapTypeName2["VSM"] = "VSM";
})(ShadowMapTypeName || (ShadowMapTypeName = {}));
var ShadowMapTypeValue;
(function(ShadowMapTypeValue2) {
  ShadowMapTypeValue2[ShadowMapTypeValue2["Basic"] = BasicShadowMap] = "Basic";
  ShadowMapTypeValue2[ShadowMapTypeValue2["PCF"] = PCFShadowMap] = "PCF";
  ShadowMapTypeValue2[ShadowMapTypeValue2["PCFSoft"] = PCFSoftShadowMap] = "PCFSoft";
  ShadowMapTypeValue2[ShadowMapTypeValue2["VSM"] = VSMShadowMap] = "VSM";
})(ShadowMapTypeValue || (ShadowMapTypeValue = {}));
const SHADOW_MAP_TYPE_NAMES = [
  ShadowMapTypeName.Basic,
  ShadowMapTypeName.PCF,
  ShadowMapTypeName.PCFSoft,
  ShadowMapTypeName.VSM
];
const SHADOW_MAP_TYPE_VALUES = [
  ShadowMapTypeValue.Basic,
  ShadowMapTypeValue.PCF,
  ShadowMapTypeValue.PCFSoft,
  ShadowMapTypeValue.VSM
];
export const SHADOW_MAP_TYPES = [BasicShadowMap, PCFShadowMap, PCFSoftShadowMap, VSMShadowMap];
export const DEFAULT_SHADOW_MAP_TYPE = ShadowMapTypeValue.PCFSoft;
const DEFAULT_PARAMS = {
  alpha: true,
  precision: RendererPrecision.highp,
  premultipliedAlpha: true,
  antialias: true,
  stencil: true,
  preserveDrawingBuffer: false,
  powerPreference: PowerPreference.DEFAULT,
  depth: true,
  logarithmicDepthBuffer: false
};
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class WebGlRendererRopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.alpha = ParamConfig.BOOLEAN(1);
    this.antialias = ParamConfig.BOOLEAN(1);
    this.tone_mapping = ParamConfig.INTEGER(DEFAULT_TONE_MAPPING, {
      menu: {
        entries: TONE_MAPPING_MENU_ENTRIES
      }
    });
    this.tone_mapping_exposure = ParamConfig.FLOAT(1, {
      range: [0, 2]
    });
    this.output_encoding = ParamConfig.INTEGER(DEFAULT_OUTPUT_ENCODING, {
      menu: {
        entries: ENCODING_NAMES.map((name, i) => {
          return {
            name,
            value: ENCODING_VALUES[i]
          };
        })
      }
    });
    this.physically_correct_lights = ParamConfig.BOOLEAN(1);
    this.sort_objects = ParamConfig.BOOLEAN(1);
    this.sampling = ParamConfig.INTEGER(1, {
      range: [1, 4],
      range_locked: [true, false]
    });
    this.tshadow_map = ParamConfig.BOOLEAN(1);
    this.shadow_map_auto_update = ParamConfig.BOOLEAN(1, {visible_if: {tshadow_map: 1}});
    this.shadow_map_needs_update = ParamConfig.BOOLEAN(0, {visible_if: {tshadow_map: 1}});
    this.shadow_map_type = ParamConfig.INTEGER(DEFAULT_SHADOW_MAP_TYPE, {
      visible_if: {tshadow_map: 1},
      menu: {
        entries: SHADOW_MAP_TYPE_NAMES.map((name, i) => {
          return {
            name,
            value: SHADOW_MAP_TYPE_VALUES[i]
          };
        })
      }
    });
  }
}
const ParamsConfig2 = new WebGlRendererRopParamsConfig();
export class WebGlRendererRopNode extends TypedRopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this._renderers_by_canvas_id = {};
  }
  static type() {
    return RopType.WEBGL;
  }
  create_renderer(canvas, gl) {
    const params = {};
    const keys = Object.keys(DEFAULT_PARAMS);
    let k;
    for (k of keys) {
      params[k] = DEFAULT_PARAMS[k];
    }
    params.antialias = this.pv.antialias;
    params.alpha = this.pv.alpha;
    params.canvas = canvas;
    params.context = gl;
    const renderer = new WebGLRenderer2(params);
    this._update_renderer(renderer);
    this._renderers_by_canvas_id[canvas.id] = renderer;
    return renderer;
  }
  cook() {
    const ids = Object.keys(this._renderers_by_canvas_id);
    for (let id of ids) {
      const renderer = this._renderers_by_canvas_id[id];
      this._update_renderer(renderer);
    }
    this._traverse_scene_and_update_materials();
    this.cook_controller.end_cook();
  }
  _update_renderer(renderer) {
    renderer.physicallyCorrectLights = this.pv.physically_correct_lights;
    renderer.outputEncoding = this.pv.output_encoding;
    renderer.toneMapping = this.pv.tone_mapping;
    renderer.toneMappingExposure = this.pv.tone_mapping_exposure;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.autoUpdate = true;
    renderer.shadowMap.needsUpdate = true;
    renderer.shadowMap.type = this.pv.shadow_map_type;
    renderer.sortObjects = this.pv.sort_objects;
    renderer.sampling = this.pv.sampling;
  }
  _traverse_scene_and_update_materials() {
    this.scene.default_scene.traverse((object) => {
      const material = object.material;
      if (material) {
        if (lodash_isArray(material)) {
          for (let mat of material) {
            mat.needsUpdate = true;
          }
        } else {
          material.needsUpdate = true;
        }
      }
    });
  }
}

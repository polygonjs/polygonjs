import {MathUtils as MathUtils2} from "three/src/math/MathUtils";
export var ColorConversion;
(function(ColorConversion2) {
  ColorConversion2["NONE"] = "no conversion";
  ColorConversion2["GAMMA_TO_LINEAR"] = "gamma -> linear";
  ColorConversion2["LINEAR_TO_GAMMA"] = "linear -> gamma";
  ColorConversion2["SRGB_TO_LINEAR"] = "sRGB -> linear";
  ColorConversion2["LINEAR_TO_SRGB"] = "linear -> sRGB";
})(ColorConversion || (ColorConversion = {}));
export const COLOR_CONVERSIONS = [
  ColorConversion.NONE,
  ColorConversion.GAMMA_TO_LINEAR,
  ColorConversion.LINEAR_TO_GAMMA,
  ColorConversion.SRGB_TO_LINEAR,
  ColorConversion.LINEAR_TO_SRGB
];
export class CoreColor {
  static set_hsv(h, s, v, target) {
    h = MathUtils2.euclideanModulo(h, 1);
    s = MathUtils2.clamp(s, 0, 1);
    v = MathUtils2.clamp(v, 0, 1);
    target.setHSL(h, s * v / ((h = (2 - s) * v) < 1 ? h : 2 - h), h * 0.5);
  }
}

import { Color } from 'three/src/math/Color';
export declare enum ColorConversion {
    NONE = "no conversion",
    GAMMA_TO_LINEAR = "gamma -> linear",
    LINEAR_TO_GAMMA = "linear -> gamma",
    SRGB_TO_LINEAR = "sRGB -> linear",
    LINEAR_TO_SRGB = "linear -> sRGB"
}
export declare const COLOR_CONVERSIONS: ColorConversion[];
export declare class CoreColor {
    static set_hsv(h: number, s: number, v: number, target: Color): void;
}

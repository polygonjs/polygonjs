import { TypedGlNode } from './_Base';
import { ShadersCollectionController } from './code/utils/ShadersCollectionController';
export declare enum ColorCorrectType {
    LINEAR = "Linear",
    GAMMA = "Gamma",
    SRGB = "sRGB",
    RGBE = "RGBE",
    RGBM = "RGBM",
    RGBD = "RGBD",
    LogLuv = "LogLuv"
}
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class ColorCorrectParamsConfig extends NodeParamsConfig {
    color: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR4>;
    from: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    to: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    gamma_factor: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
}
export declare class ColorCorrectGlNode extends TypedGlNode<ColorCorrectParamsConfig> {
    params_config: ColorCorrectParamsConfig;
    static type(): string;
    static INPUT_NAME: string;
    static INPUT_GAMMA_FACTOR: string;
    static OUTPUT_NAME: string;
    initialize_node(): void;
    set_lines(shaders_collection_controller: ShadersCollectionController): void;
}
export {};

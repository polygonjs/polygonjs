import { TypedCopNode } from './_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class ColorCopParamsConfig extends NodeParamsConfig {
    resolution: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR2>;
    color: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.COLOR>;
}
export declare class ColorCopNode extends TypedCopNode<ColorCopParamsConfig> {
    params_config: ColorCopParamsConfig;
    static type(): string;
    private _data_texture;
    cook(): void;
    private _create_data_texture;
    private _create_pixel_buffer;
    static PARAM_CALLBACK_reset(node: ColorCopNode): void;
    private _reset;
}
export {};

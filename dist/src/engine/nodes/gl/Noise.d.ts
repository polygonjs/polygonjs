import { TypedGlNode } from './_Base';
import { GlConnectionsController } from './utils/ConnectionsController';
declare enum InputName {
    AMP = "amp",
    POSITION = "position",
    FREQ = "freq",
    OFFSET = "offset"
}
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { ShadersCollectionController } from './code/utils/ShadersCollectionController';
declare class NoiseGlParamsConfig extends NodeParamsConfig {
    type: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    output_type: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    octaves: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    amp_attenuation: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    freq_increase: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    separator: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.SEPARATOR>;
}
export declare class NoiseGlNode extends TypedGlNode<NoiseGlParamsConfig> {
    params_config: NoiseGlParamsConfig;
    static type(): string;
    readonly gl_connections_controller: GlConnectionsController;
    initialize_node(): void;
    protected _gl_input_name(index: number): InputName;
    gl_input_default_value(name: string): number;
    private _expected_input_types;
    private _expected_output_types;
    set_lines(shaders_collection_controller: ShadersCollectionController): void;
    private fbm_method_name;
    private fbm_function;
    private single_noise_line;
}
export {};

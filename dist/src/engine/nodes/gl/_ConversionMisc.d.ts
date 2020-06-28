import { TypedGlNode } from './_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { ShadersCollectionController } from './code/utils/ShadersCollectionController';
declare class FloatToIntGlParamsConfig extends NodeParamsConfig {
    float: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
}
export declare class FloatToIntGlNode extends TypedGlNode<FloatToIntGlParamsConfig> {
    params_config: FloatToIntGlParamsConfig;
    static type(): string;
    initialize_node(): void;
    set_lines(shaders_collection_controller: ShadersCollectionController): void;
}
declare class IntToFloatGlParamsConfig extends NodeParamsConfig {
    int: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
}
export declare class IntToFloatGlNode extends TypedGlNode<IntToFloatGlParamsConfig> {
    params_config: IntToFloatGlParamsConfig;
    static type(): string;
    initialize_node(): void;
    set_lines(shaders_collection_controller: ShadersCollectionController): void;
}
export {};

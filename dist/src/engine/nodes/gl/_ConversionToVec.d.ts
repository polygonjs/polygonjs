import { TypedGlNode } from './_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { ShadersCollectionController } from './code/utils/ShadersCollectionController';
declare class FloatToVec2GlParamsConfig extends NodeParamsConfig {
    x: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    y: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
}
export declare class FloatToVec2GlNode extends TypedGlNode<FloatToVec2GlParamsConfig> {
    params_config: FloatToVec2GlParamsConfig;
    static type(): string;
    static readonly OUTPUT_NAME = "vec2";
    initialize_node(): void;
    set_lines(shaders_collection_controller: ShadersCollectionController): void;
}
declare class FloatToVec3GlParamsConfig extends NodeParamsConfig {
    x: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    y: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    z: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
}
export declare class FloatToVec3GlNode extends TypedGlNode<FloatToVec3GlParamsConfig> {
    params_config: FloatToVec3GlParamsConfig;
    static type(): string;
    static readonly OUTPUT_NAME = "vec3";
    initialize_node(): void;
    set_lines(shaders_collection_controller: ShadersCollectionController): void;
}
declare class FloatToVec4GlParamsConfig extends NodeParamsConfig {
    x: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    y: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    z: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    w: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
}
export declare class FloatToVec4GlNode extends TypedGlNode<FloatToVec4GlParamsConfig> {
    params_config: FloatToVec4GlParamsConfig;
    static type(): string;
    static readonly OUTPUT_NAME = "vec4";
    initialize_node(): void;
    set_lines(shaders_collection_controller: ShadersCollectionController): void;
}
export {};

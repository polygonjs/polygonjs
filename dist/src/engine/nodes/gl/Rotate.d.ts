import { TypedGlNode } from './_Base';
import { FunctionGLDefinition } from './utils/GLDefinition';
import { GlConnectionPointType } from '../utils/io/connections/Gl';
export declare enum GlRotateMode {
    AXIS = 0,
    QUAT = 1
}
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { ShadersCollectionController } from './code/utils/ShadersCollectionController';
declare class RotateParamsConfig extends NodeParamsConfig {
    signature: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
}
export declare class RotateGlNode extends TypedGlNode<RotateParamsConfig> {
    params_config: RotateParamsConfig;
    static type(): string;
    initialize_node(): void;
    set_signature(mode: GlRotateMode): void;
    protected _gl_input_name(index: number): string;
    param_default_value(name: string): Number3;
    gl_method_name(): string;
    protected _expected_input_types(): GlConnectionPointType[];
    protected _expected_output_types(): GlConnectionPointType[];
    gl_function_definitions(): FunctionGLDefinition[];
    set_lines(shaders_collection_controller: ShadersCollectionController): void;
}
export {};

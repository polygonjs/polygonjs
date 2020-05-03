import { BaseAdaptiveGlNode } from './_BaseAdaptive';
import { FunctionGLDefinition } from './utils/GLDefinition';
import { GlConnectionPointType } from '../utils/io/connections/Gl';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { ShadersCollectionController } from './code/utils/ShadersCollectionController';
declare class RotateParamsConfig extends NodeParamsConfig {
    signature: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
}
export declare class RotateGlNode extends BaseAdaptiveGlNode<RotateParamsConfig> {
    params_config: RotateParamsConfig;
    static type(): string;
    initialize_node(): void;
    protected _gl_input_name(index: number): string;
    gl_input_default_value(name: string): Number3;
    gl_method_name(): string;
    protected _expected_input_types(): GlConnectionPointType[];
    protected _expected_output_types(): GlConnectionPointType[];
    gl_function_definitions(): FunctionGLDefinition[];
    set_lines(shaders_collection_controller: ShadersCollectionController): void;
}
export {};

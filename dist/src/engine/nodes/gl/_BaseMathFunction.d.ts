import { TypedGlNode } from './_Base';
import { ShadersCollectionController } from './code/utils/ShadersCollectionController';
import { GlConnectionPointType } from '../utils/io/connections/Gl';
import { GLDefinitionType, TypedGLDefinition } from './utils/GLDefinition';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
export declare class BaseGlMathFunctionParamsConfig extends NodeParamsConfig {
}
export declare abstract class BaseGlMathFunctionGlNode extends TypedGlNode<BaseGlMathFunctionParamsConfig> {
    params_config: BaseGlMathFunctionParamsConfig;
    protected gl_method_name(): string;
    protected gl_function_definitions(): TypedGLDefinition<GLDefinitionType>[];
    initialize_node(): void;
    protected _expected_input_types(): GlConnectionPointType[];
    protected _expected_output_types(): GlConnectionPointType[];
    protected _gl_input_name(index: number): string;
    set_lines(shaders_collection_controller: ShadersCollectionController): void;
}
export declare abstract class BaseNodeGlMathFunctionArg1GlNode extends BaseGlMathFunctionGlNode {
    protected _gl_input_name(index: number): string;
    protected _expected_input_types(): GlConnectionPointType[];
}
export declare abstract class BaseNodeGlMathFunctionArg2GlNode extends BaseGlMathFunctionGlNode {
    protected _expected_input_types(): GlConnectionPointType[];
}
export declare abstract class BaseNodeGlMathFunctionArg3GlNode extends BaseGlMathFunctionGlNode {
    protected _expected_input_types(): GlConnectionPointType[];
}
export declare abstract class BaseNodeGlMathFunctionArg4GlNode extends BaseGlMathFunctionGlNode {
    protected _expected_input_types(): GlConnectionPointType[];
}
export declare abstract class BaseNodeGlMathFunctionArg5GlNode extends BaseGlMathFunctionGlNode {
    protected _expected_input_types(): GlConnectionPointType[];
}

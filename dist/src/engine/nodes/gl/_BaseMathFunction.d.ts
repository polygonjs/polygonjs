import { BaseAdaptiveGlNode } from './_BaseAdaptive';
import { ShadersCollectionController } from './code/utils/ShadersCollectionController';
import { ConnectionPointType } from '../utils/connections/ConnectionPointType';
import { GLDefinitionType, TypedGLDefinition } from './utils/GLDefinition';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class BaseGlMathFunctionParamsConfig extends NodeParamsConfig {
}
export declare abstract class BaseGlMathFunctionGlNode extends BaseAdaptiveGlNode<BaseGlMathFunctionParamsConfig> {
    params_config: BaseGlMathFunctionParamsConfig;
    protected gl_method_name(): string;
    protected gl_function_definitions(): TypedGLDefinition<GLDefinitionType>[];
    initialize_node(): void;
    protected _expected_input_types(): ConnectionPointType[];
    protected _expected_output_types(): ConnectionPointType[];
    protected _gl_input_name(index: number): string;
    set_lines(shaders_collection_controller: ShadersCollectionController): void;
}
export declare abstract class BaseNodeGlMathFunctionArg1GlNode extends BaseGlMathFunctionGlNode {
    protected _gl_input_name(index: number): string;
    protected _expected_input_types(): ConnectionPointType[];
}
export declare abstract class BaseNodeGlMathFunctionArg2GlNode extends BaseGlMathFunctionGlNode {
    protected _expected_input_types(): ConnectionPointType[];
}
export declare abstract class BaseNodeGlMathFunctionArg3GlNode extends BaseGlMathFunctionGlNode {
    protected _expected_input_types(): ConnectionPointType[];
}
export declare abstract class BaseNodeGlMathFunctionArg4GlNode extends BaseGlMathFunctionGlNode {
    protected _expected_input_types(): ConnectionPointType[];
}
export declare abstract class BaseNodeGlMathFunctionArg5GlNode extends BaseGlMathFunctionGlNode {
    protected _expected_input_types(): ConnectionPointType[];
}
export {};

import { BaseNodeGlMathFunctionArg5GlNode } from './_BaseMathFunction';
import { BaseNodeGlMathFunctionArg3GlNode } from './_BaseMathFunction';
import { FunctionGLDefinition } from './utils/GLDefinition';
export declare class FitGlNode extends BaseNodeGlMathFunctionArg5GlNode {
    static type(): string;
    protected _gl_input_name(index: number): string;
    param_default_value(name: string): number;
    protected gl_method_name(): string;
    gl_function_definitions(): FunctionGLDefinition[];
}
export declare class FitTo01GlNode extends BaseNodeGlMathFunctionArg3GlNode {
    static type(): string;
    _gl_input_name(index: number): string;
    param_default_value(name: string): number;
    gl_method_name(): string;
    gl_function_definitions(): FunctionGLDefinition[];
}
export declare class FitFrom01GlNode extends BaseNodeGlMathFunctionArg3GlNode {
    static type(): string;
    _gl_input_name(index: number): string;
    param_default_value(name: string): number;
    gl_method_name(): string;
    gl_function_definitions(): FunctionGLDefinition[];
}
export declare class FitFrom01ToVarianceGlNode extends BaseNodeGlMathFunctionArg3GlNode {
    static type(): string;
    _gl_input_name(index: number): string;
    param_default_value(name: string): number;
    gl_method_name(): string;
    gl_function_definitions(): FunctionGLDefinition[];
}

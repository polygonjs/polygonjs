import { BaseNodeGlMathFunctionArg3GlNode } from './_BaseMathFunction';
import { FunctionGLDefinition } from './utils/GLDefinition';
export declare class Fit01GlNode extends BaseNodeGlMathFunctionArg3GlNode {
    static type(): string;
    _gl_input_name(index: number): string;
    gl_input_default_value(name: string): number;
    gl_method_name(): string;
    gl_function_definitions(): FunctionGLDefinition[];
}

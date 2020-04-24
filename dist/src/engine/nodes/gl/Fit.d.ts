import { BaseNodeGlMathFunctionArg5GlNode } from './_BaseMathFunction';
import { FunctionGLDefinition } from './utils/GLDefinition';
export declare class FitGlNode extends BaseNodeGlMathFunctionArg5GlNode {
    static type(): string;
    protected _gl_input_name(index: number): string;
    gl_input_default_value(name: string): number;
    protected gl_method_name(): string;
    gl_function_definitions(): FunctionGLDefinition[];
}

import { BaseNodeGlMathFunctionArg1GlNode } from './_BaseMathFunction';
import { FunctionGLDefinition } from './utils/GLDefinition';
export declare class ComplementGlNode extends BaseNodeGlMathFunctionArg1GlNode {
    static type(): string;
    gl_method_name(): string;
    gl_function_definitions(): FunctionGLDefinition[];
}

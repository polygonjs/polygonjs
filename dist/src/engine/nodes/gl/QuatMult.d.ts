import { BaseNodeGlMathFunctionArg1GlNode } from './_BaseMathFunction';
import { FunctionGLDefinition } from './utils/GLDefinition';
export declare class QuatMultGlNode extends BaseNodeGlMathFunctionArg1GlNode {
    static type(): string;
    initialize_node(): void;
    gl_method_name(): string;
    gl_function_definitions(): FunctionGLDefinition[];
}

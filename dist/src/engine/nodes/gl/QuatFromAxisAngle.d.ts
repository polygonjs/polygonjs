import { BaseNodeGlMathFunctionArg2GlNode } from './_BaseMathFunction';
import { FunctionGLDefinition } from './utils/GLDefinition';
export declare class QuatFromAxisAngleGlNode extends BaseNodeGlMathFunctionArg2GlNode {
    static type(): string;
    initialize_node(): void;
    gl_input_default_value(name: string): number | Number3;
    gl_method_name(): string;
    gl_function_definitions(): FunctionGLDefinition[];
}

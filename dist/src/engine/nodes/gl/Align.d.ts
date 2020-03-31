import { BaseNodeGlMathFunctionArg2GlNode } from './_BaseMathFunction';
import { FunctionGLDefinition } from './utils/GLDefinition';
export declare class AlignGlNode extends BaseNodeGlMathFunctionArg2GlNode {
    static type(): string;
    initialize_node(): void;
    gl_input_default_value(name: string): Number3;
    gl_method_name(): string;
    gl_function_definitions(): FunctionGLDefinition[];
}

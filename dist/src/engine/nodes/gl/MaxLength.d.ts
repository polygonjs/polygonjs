import { BaseNodeGlMathFunctionArg2GlNode } from './_BaseMathFunction';
import { FunctionGLDefinition } from './utils/GLDefinition';
import { GlConnectionPointType } from '../utils/io/connections/Gl';
export declare class MaxLengthGlNode extends BaseNodeGlMathFunctionArg2GlNode {
    static type(): string;
    protected _expected_input_types(): GlConnectionPointType[];
    protected _gl_input_name(index: number): string;
    param_default_value(name: string): number;
    protected gl_method_name(): string;
    gl_function_definitions(): FunctionGLDefinition[];
}

import { BaseNodeGlMathFunctionArg1GlNode } from './_BaseMathFunction';
import { GlConnectionPointType } from '../utils/io/connections/Gl';
export declare class LengthGlNode extends BaseNodeGlMathFunctionArg1GlNode {
    static type(): string;
    initialize_node(): void;
    protected _gl_input_name(index: number): string;
    gl_method_name(): string;
    protected _expected_output_types(): GlConnectionPointType[];
}

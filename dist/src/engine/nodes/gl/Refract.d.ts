import { BaseGlMathFunctionGlNode } from './_BaseMathFunction';
import { GlConnectionPointType } from '../utils/io/connections/Gl';
export declare class RefractGlNode extends BaseGlMathFunctionGlNode {
    static type(): string;
    initialize_node(): void;
    gl_method_name(): string;
    protected _expected_input_types(): GlConnectionPointType[];
    protected _expected_output_types(): GlConnectionPointType[];
}

import { BaseGlMathFunctionGlNode } from './_BaseMathFunction';
import { ConnectionPointType } from '../utils/connections/ConnectionPointType';
export declare class RefractGlNode extends BaseGlMathFunctionGlNode {
    static type(): string;
    initialize_node(): void;
    gl_method_name(): string;
    protected _expected_input_types(): ConnectionPointType[];
    protected _expected_output_types(): ConnectionPointType[];
}

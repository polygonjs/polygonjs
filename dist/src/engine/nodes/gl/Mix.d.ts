import { BaseGlMathFunctionGlNode } from './_BaseMathFunction';
import { ConnectionPointType } from '../utils/connections/ConnectionPointType';
export declare class MixGlNode extends BaseGlMathFunctionGlNode {
    static type(): string;
    protected gl_method_name(): string;
    gl_input_default_value(name: string): number;
    initialize_node(): void;
    protected _gl_output_name(): string;
    protected _expected_input_types(): ConnectionPointType[];
    protected _expected_output_types(): ConnectionPointType[];
}

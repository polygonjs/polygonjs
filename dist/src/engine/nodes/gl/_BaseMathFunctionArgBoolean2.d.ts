import { BaseNodeGlMathFunctionArg2GlNode } from './_BaseMathFunction';
import { ConnectionPointType } from '../utils/connections/ConnectionPointType';
import { ShadersCollectionController } from './code/utils/ShadersCollectionController';
export declare abstract class BaseNodeGlMathFunctionArgBoolean2GlNode extends BaseNodeGlMathFunctionArg2GlNode {
    initialize_node(): void;
    protected _expected_input_types(): ConnectionPointType[];
    protected _expected_output_types(): ConnectionPointType[];
    abstract boolean_operation(): string;
    set_lines(shaders_collection_controller: ShadersCollectionController): void;
}

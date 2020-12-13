import { BaseNodeGlMathFunctionArg2GlNode } from './_BaseMathFunction';
import { GlConnectionPointType } from '../utils/io/connections/Gl';
import { ShadersCollectionController } from './code/utils/ShadersCollectionController';
export declare abstract class BaseNodeGlMathFunctionArgBoolean2GlNode extends BaseNodeGlMathFunctionArg2GlNode {
    initialize_node(): void;
    protected _expected_input_types(): GlConnectionPointType[];
    protected _expected_output_types(): GlConnectionPointType[];
    abstract boolean_operation(): string;
    set_lines(shaders_collection_controller: ShadersCollectionController): void;
}

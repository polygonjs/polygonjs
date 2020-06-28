import { BaseNodeGlMathFunctionArg1GlNode } from './_BaseMathFunction';
import { ShadersCollectionController } from './code/utils/ShadersCollectionController';
export declare class NegateGlNode extends BaseNodeGlMathFunctionArg1GlNode {
    static type(): string;
    initialize_node(): void;
    protected _gl_input_name(index: number): string;
    set_lines(shaders_collection_controller: ShadersCollectionController): void;
}

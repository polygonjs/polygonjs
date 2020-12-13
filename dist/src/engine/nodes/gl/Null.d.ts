import { BaseNodeGlMathFunctionArg1GlNode } from './_BaseMathFunction';
import { ShadersCollectionController } from './code/utils/ShadersCollectionController';
export declare class NullGlNode extends BaseNodeGlMathFunctionArg1GlNode {
    static type(): string;
    set_lines(shaders_collection_controller: ShadersCollectionController): void;
}

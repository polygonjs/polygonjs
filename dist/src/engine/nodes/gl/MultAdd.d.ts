import { BaseNodeGlMathFunctionArg4GlNode } from './_BaseMathFunction';
import { ShadersCollectionController } from './code/utils/ShadersCollectionController';
declare enum InputName {
    VALUE = "value",
    PRE_ADD = "pre_add",
    MULT = "mult",
    POST_ADD = "post_add"
}
export declare class MultAddGlNode extends BaseNodeGlMathFunctionArg4GlNode {
    static type(): string;
    protected _gl_input_name(index: number): InputName;
    gl_input_default_value(name: string): number;
    set_lines(shaders_collection_controller: ShadersCollectionController): void;
}
export {};

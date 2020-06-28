import { ParamlessTypedGlNode } from './_Base';
declare enum InputName {
    CONDITION = "condition",
    IF_TRUE = "if_true",
    IF_FALSE = "if_false"
}
import { GlConnectionPointType } from '../utils/io/connections/Gl';
import { ShadersCollectionController } from './code/utils/ShadersCollectionController';
export declare class TwoWaySwitchGlNode extends ParamlessTypedGlNode {
    static type(): string;
    initialize_node(): void;
    protected _gl_input_name(index: number): InputName;
    protected _gl_output_name(): string;
    protected _expected_input_types(): GlConnectionPointType[];
    protected _expected_output_types(): GlConnectionPointType[];
    set_lines(shaders_collection_controller: ShadersCollectionController): void;
}
export {};

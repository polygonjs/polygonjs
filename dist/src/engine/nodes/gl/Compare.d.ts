import { TypedGlNode } from './_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { ShadersCollectionController } from './code/utils/ShadersCollectionController';
import { GlConnectionPointType } from '../utils/io/connections/Gl';
export declare enum GlCompareTestName {
    EQUAL = "Equal",
    LESS_THAN = "Less Than",
    GREATER_THAN = "Greater Than",
    LESS_THAN_OR_EQUAL = "Less Than Or Equal",
    GREATER_THAN_OR_EQUAL = "Greater Than Or Equal",
    NOT_EQUAL = "Not Equal"
}
declare class CompareGlParamsConfig extends NodeParamsConfig {
    test: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
}
export declare class CompareGlNode extends TypedGlNode<CompareGlParamsConfig> {
    params_config: CompareGlParamsConfig;
    static type(): string;
    initialize_node(): void;
    set_test_name(test: GlCompareTestName): void;
    protected _gl_input_name(index: number): string;
    protected _expected_input_type(): GlConnectionPointType[];
    set_lines(shaders_collection_controller: ShadersCollectionController): void;
}
export {};

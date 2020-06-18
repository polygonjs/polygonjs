import { TypedGlNode } from './_Base';
import { GlConnectionPointType } from '../utils/io/connections/Gl';
import { ShadersCollectionController } from './code/utils/ShadersCollectionController';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class SwitchParamsConfig extends NodeParamsConfig {
}
export declare class SwitchGlNode extends TypedGlNode<SwitchParamsConfig> {
    params_config: SwitchParamsConfig;
    static type(): string;
    static INPUT_INDEX: string;
    initialize_node(): void;
    protected _gl_input_name(index: number): string;
    protected _expected_input_types(): GlConnectionPointType[];
    protected _expected_output_types(): GlConnectionPointType[];
    set_lines(shaders_collection_controller: ShadersCollectionController): void;
}
export {};

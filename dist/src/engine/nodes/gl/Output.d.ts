import { TypedGlNode } from './_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { ShadersCollectionController } from './code/utils/ShadersCollectionController';
declare class OutputGlParamsConfig extends NodeParamsConfig {
}
export declare class OutputGlNode extends TypedGlNode<OutputGlParamsConfig> {
    params_config: OutputGlParamsConfig;
    static type(): string;
    initialize_node(): void;
    create_params(): void;
    set_lines(shaders_collection_controller: ShadersCollectionController): void;
}
export {};

import { TypedGlNode } from './_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { ShadersCollectionController } from './code/utils/ShadersCollectionController';
declare class GlobalsGlParamsConfig extends NodeParamsConfig {
}
export declare class GlobalsGlNode extends TypedGlNode<GlobalsGlParamsConfig> {
    params_config: GlobalsGlParamsConfig;
    static type(): string;
    initialize_node(): void;
    set_lines(shaders_collection_controller: ShadersCollectionController): void;
}
export {};

import { TypedGlNode } from './_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { ShadersCollectionController } from './code/utils/ShadersCollectionController';
declare class CrossGlParamsConfig extends NodeParamsConfig {
    x: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
    y: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
}
export declare class CrossGlNode extends TypedGlNode<CrossGlParamsConfig> {
    params_config: CrossGlParamsConfig;
    static type(): string;
    initialize_node(): void;
    set_lines(shaders_collection_controller: ShadersCollectionController): void;
}
export {};

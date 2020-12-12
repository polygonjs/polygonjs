import { TypedGlNode } from './_Base';
import { ShadersCollectionController } from './code/utils/ShadersCollectionController';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class HsvToRgbGlParamsConfig extends NodeParamsConfig {
    hsv: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
}
export declare class HsvToRgbGlNode extends TypedGlNode<HsvToRgbGlParamsConfig> {
    params_config: HsvToRgbGlParamsConfig;
    static type(): string;
    initialize_node(): void;
    set_lines(shaders_collection_controller: ShadersCollectionController): void;
}
export {};

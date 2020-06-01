import { TypedGlNode } from './_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { ShadersCollectionController } from './code/utils/ShadersCollectionController';
declare class RgbToHsvGlParamsConfig extends NodeParamsConfig {
    rgb: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
}
export declare class RgbToHsvGlNode extends TypedGlNode<RgbToHsvGlParamsConfig> {
    params_config: RgbToHsvGlParamsConfig;
    static type(): string;
    initialize_node(): void;
    set_lines(shaders_collection_controller: ShadersCollectionController): void;
}
export {};

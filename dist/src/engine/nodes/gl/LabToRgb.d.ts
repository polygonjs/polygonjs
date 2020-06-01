import { TypedGlNode } from './_Base';
import { ShadersCollectionController } from './code/utils/ShadersCollectionController';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class LabToRgbGlParamsConfig extends NodeParamsConfig {
    lab: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
}
export declare class LabToRgbGlNode extends TypedGlNode<LabToRgbGlParamsConfig> {
    params_config: LabToRgbGlParamsConfig;
    static type(): string;
    initialize_node(): void;
    set_lines(shaders_collection_controller: ShadersCollectionController): void;
}
export {};

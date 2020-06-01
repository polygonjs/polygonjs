import { TypedGlNode } from './_Base';
import { ShadersCollectionController } from './code/utils/ShadersCollectionController';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class AccelerationGlParamsConfig extends NodeParamsConfig {
    position: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
    velocity: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
    mass: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    force: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
}
export declare class AccelerationGlNode extends TypedGlNode<AccelerationGlParamsConfig> {
    params_config: AccelerationGlParamsConfig;
    static type(): string;
    static readonly INPUT_NAME = "export";
    initialize_node(): void;
    set_lines(shaders_collection_controller: ShadersCollectionController): void;
}
export {};

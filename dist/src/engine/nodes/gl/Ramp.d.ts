import { TypedGlNode } from './_Base';
import { ShadersCollectionController } from './code/utils/ShadersCollectionController';
import { ParamType } from '../../poly/ParamType';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class RampGlParamsConfig extends NodeParamsConfig {
    name: import("../utils/params/ParamsConfig").ParamTemplate<ParamType.STRING>;
    input: import("../utils/params/ParamsConfig").ParamTemplate<ParamType.FLOAT>;
}
export declare class RampGlNode extends TypedGlNode<RampGlParamsConfig> {
    params_config: RampGlParamsConfig;
    static type(): Readonly<'ramp'>;
    initialize_node(): void;
    set_lines(shaders_collection_controller: ShadersCollectionController): void;
    set_param_configs(): void;
    private _uniform_name;
}
export {};

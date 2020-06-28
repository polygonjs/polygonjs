import { TypedGlNode } from './_Base';
import { GlConnectionPointType } from '../utils/io/connections/Gl';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { ParamType } from '../../poly/ParamType';
import { ShadersCollectionController } from './code/utils/ShadersCollectionController';
declare class ParamGlParamsConfig extends NodeParamsConfig {
    name: import("../utils/params/ParamsConfig").ParamTemplate<ParamType.STRING>;
    type: import("../utils/params/ParamsConfig").ParamTemplate<ParamType.INTEGER>;
    as_color: import("../utils/params/ParamsConfig").ParamTemplate<ParamType.BOOLEAN>;
}
export declare class ParamGlNode extends TypedGlNode<ParamGlParamsConfig> {
    params_config: ParamGlParamsConfig;
    static type(): string;
    protected _allow_inputs_created_from_params: boolean;
    private _on_create_set_name_if_none_bound;
    initialize_node(): void;
    set_lines(shaders_collection_controller: ShadersCollectionController): void;
    set_param_configs(): void;
    uniform_name(): string;
    set_gl_type(type: GlConnectionPointType): void;
    private _on_create_set_name_if_none;
}
export {};

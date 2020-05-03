import { TypedGlNode } from './_Base';
import { GlConnectionPointType } from '../utils/io/connections/Gl';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { ShadersCollectionController } from './code/utils/ShadersCollectionController';
import { GlConnectionsController } from './utils/ConnectionsController';
declare class ConstantGlParamsConfig extends NodeParamsConfig {
    type: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    bool: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    int: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    float: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    vec2: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR2>;
    vec3: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
    vec4: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR4>;
}
export declare class ConstantGlNode extends TypedGlNode<ConstantGlParamsConfig> {
    params_config: ConstantGlParamsConfig;
    static type(): string;
    static readonly OUTPUT_NAME = "val";
    private _params_by_type;
    readonly gl_connections_controller: GlConnectionsController;
    protected _allow_inputs_created_from_params: boolean;
    initialize_node(): void;
    set_lines(shaders_collection_controller: ShadersCollectionController): void;
    private get _current_connection_type();
    private get _current_param();
    private get _current_var_name();
    set_gl_type(type: GlConnectionPointType): void;
}
export {};

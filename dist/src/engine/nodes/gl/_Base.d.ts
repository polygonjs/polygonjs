import { TypedNode } from '../_Base';
import { BaseGlShaderAssembler } from './code/assemblers/_Base';
import { AssemblerControllerNode } from './code/Controller';
import { NodeContext } from '../../poly/NodeContext';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { ParamConfigsController } from '../utils/code/controllers/ParamConfigsController';
import { ShadersCollectionController } from './code/utils/ShadersCollectionController';
import { ParamInitValueSerialized } from '../../params/types/ParamInitValueSerialized';
import { GlNodeSpareParamsController } from './utils/SpareParamsController';
import { GlConnectionsController } from './utils/ConnectionsController';
export declare class TypedGlNode<K extends NodeParamsConfig> extends TypedNode<'GL', BaseGlNodeType, K> {
    static node_context(): NodeContext;
    protected _param_configs_controller: ParamConfigsController | undefined;
    protected _assembler: BaseGlShaderAssembler | undefined;
    readonly spare_params_controller: GlNodeSpareParamsController;
    readonly gl_connections_controller: GlConnectionsController | undefined;
    initialize_base_node(): void;
    node_sibbling(name: string): BaseGlNodeType | null;
    cook(): void;
    protected _set_mat_to_recompile(): void;
    get material_node(): AssemblerControllerNode | undefined;
    gl_var_name(name: string): string;
    variable_for_input(name: string): string;
    set_lines(shaders_collection_controller: ShadersCollectionController): void;
    reset_code(): void;
    set_param_configs(): void;
    param_configs(): readonly import("../utils/code/configs/ParamConfig").ParamConfig<import("../../poly/ParamType").ParamType>[] | undefined;
    gl_input_default_value(name: string): ParamInitValueSerialized;
}
export declare type BaseGlNodeType = TypedGlNode<NodeParamsConfig>;
export declare class BaseGlNodeClass extends TypedGlNode<NodeParamsConfig> {
}
declare class ParamlessParamsConfig extends NodeParamsConfig {
}
export declare class ParamlessTypedGlNode extends TypedGlNode<ParamlessParamsConfig> {
    params_config: ParamlessParamsConfig;
}
export {};

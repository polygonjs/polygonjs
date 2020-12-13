import { TypedNode } from '../_Base';
import { BaseJsFunctionAssembler } from './code/assemblers/_Base';
import { AssemblerControllerNode } from './code/Controller';
import { NodeContext } from '../../poly/NodeContext';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { ParamConfigsController } from '../utils/code/controllers/ParamConfigsController';
import { LinesController } from './code/utils/LinesController';
import { ParamInitValueSerialized } from '../../params/types/ParamInitValueSerialized';
import { JsParamConfig } from './code/utils/ParamConfig';
import { ParamType } from '../../poly/ParamType';
export declare class TypedJsNode<K extends NodeParamsConfig> extends TypedNode<NodeContext.JS, K> {
    static node_context(): NodeContext;
    protected _param_configs_controller: ParamConfigsController<JsParamConfig<ParamType>> | undefined;
    protected _assembler: BaseJsFunctionAssembler | undefined;
    initialize_base_node(): void;
    cook(): void;
    protected _set_function_node_to_recompile(): void;
    get function_node(): AssemblerControllerNode | undefined;
    js_var_name(name: string): string;
    variable_for_input(name: string): string;
    set_lines(lines_controller: LinesController): void;
    reset_code(): void;
    set_param_configs(): void;
    param_configs(): readonly JsParamConfig<ParamType>[] | undefined;
    js_input_default_value(name: string): ParamInitValueSerialized;
}
export declare type BaseJsNodeType = TypedJsNode<NodeParamsConfig>;
export declare class BaseJsNodeClass extends TypedJsNode<NodeParamsConfig> {
}
declare class ParamlessParamsConfig extends NodeParamsConfig {
}
export declare class ParamlessTypedJsNode extends TypedJsNode<ParamlessParamsConfig> {
    params_config: ParamlessParamsConfig;
}
export {};

import { TypedJsNode } from './_Base';
import { JsConnectionPointType } from '../utils/io/connections/Js';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { ParamType } from '../../poly/ParamType';
import { LinesController } from './code/utils/LinesController';
import { JsConnectionsController } from './utils/ConnectionsController';
declare class ParamJsParamsConfig extends NodeParamsConfig {
    name: import("../utils/params/ParamsConfig").ParamTemplate<ParamType.STRING>;
    type: import("../utils/params/ParamsConfig").ParamTemplate<ParamType.INTEGER>;
    as_color: import("../utils/params/ParamsConfig").ParamTemplate<ParamType.BOOLEAN>;
}
export declare class ParamJsNode extends TypedJsNode<ParamJsParamsConfig> {
    params_config: ParamJsParamsConfig;
    static type(): string;
    protected _allow_inputs_created_from_params: boolean;
    private _on_create_set_name_if_none_bound;
    readonly js_connections_controller: JsConnectionsController;
    initialize_node(): void;
    set_lines(lines_controller: LinesController): void;
    set_param_configs(): void;
    uniform_name(): string;
    set_gl_type(type: JsConnectionPointType): void;
    private _on_create_set_name_if_none;
}
export {};

import { TypedJsNode, BaseJsNodeType } from './_Base';
import { ParamType } from '../../poly/ParamType';
import { LinesController } from './code/utils/LinesController';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { JsConnectionPointType, BaseJsConnectionPoint } from '../utils/io/connections/Js';
declare class AttributeJsParamsConfig extends NodeParamsConfig {
    name: import("../utils/params/ParamsConfig").ParamTemplate<ParamType.STRING>;
    type: import("../utils/params/ParamsConfig").ParamTemplate<ParamType.INTEGER>;
}
export declare class AttributeJsNode extends TypedJsNode<AttributeJsParamsConfig> {
    params_config: AttributeJsParamsConfig;
    static type(): string;
    static readonly INPUT_NAME = "export";
    static readonly OUTPUT_NAME = "val";
    private _on_create_set_name_if_none_bound;
    initialize_node(): void;
    create_params(): void;
    get input_name(): string;
    get output_name(): string;
    set_lines(lines_controller: LinesController): void;
    get attribute_name(): string;
    gl_type(): JsConnectionPointType;
    set_gl_type(type: JsConnectionPointType): void;
    connected_input_node(): BaseJsNodeType | null;
    connected_input_connection_point(): BaseJsConnectionPoint | undefined;
    output_connection_point(): BaseJsConnectionPoint | undefined;
    get is_importing(): boolean;
    get is_exporting(): boolean;
    private _set_mat_to_recompile_if_is_exporting;
    private _on_create_set_name_if_none;
}
export {};

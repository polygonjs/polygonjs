import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { TypedEventNode } from './_Base';
import { EventContext } from '../../scene/utils/events/_BaseEventsController';
import { ParamType } from '../../poly/ParamType';
declare class SetParamParamsConfig extends NodeParamsConfig {
    param: import("../utils/params/ParamsConfig").ParamTemplate<ParamType.OPERATOR_PATH>;
    type: import("../utils/params/ParamsConfig").ParamTemplate<ParamType.INTEGER>;
    toggle: import("../utils/params/ParamsConfig").ParamTemplate<ParamType.BOOLEAN>;
    boolean: import("../utils/params/ParamsConfig").ParamTemplate<ParamType.BOOLEAN>;
    number: import("../utils/params/ParamsConfig").ParamTemplate<ParamType.FLOAT>;
    vector2: import("../utils/params/ParamsConfig").ParamTemplate<ParamType.VECTOR2>;
    vector3: import("../utils/params/ParamsConfig").ParamTemplate<ParamType.VECTOR3>;
    vector4: import("../utils/params/ParamsConfig").ParamTemplate<ParamType.VECTOR4>;
    increment: import("../utils/params/ParamsConfig").ParamTemplate<ParamType.BOOLEAN>;
    string: import("../utils/params/ParamsConfig").ParamTemplate<ParamType.STRING>;
    execute: import("../utils/params/ParamsConfig").ParamTemplate<ParamType.BUTTON>;
}
export declare class SetParamEventNode extends TypedEventNode<SetParamParamsConfig> {
    params_config: SetParamParamsConfig;
    static type(): string;
    initialize_node(): void;
    process_event(event_context: EventContext<Event>): Promise<void>;
    private _tmp_vector2;
    private _tmp_vector3;
    private _tmp_vector4;
    private _tmp_array2;
    private _tmp_array3;
    private _tmp_array4;
    private _new_param_value;
    static PARAM_CALLBACK_execute(node: SetParamEventNode): void;
}
export {};

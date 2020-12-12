import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { TypedEventNode } from './_Base';
import { EventContext } from '../../scene/utils/events/_BaseEventsController';
declare class SetFlagParamsConfig extends NodeParamsConfig {
    mask: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
    sep0: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.SEPARATOR>;
    tdisplay: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    display_mode: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    display: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    sep1: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.SEPARATOR>;
    tbypass: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    bypass_mode: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    bypass: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    execute: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BUTTON>;
}
export declare class SetFlagEventNode extends TypedEventNode<SetFlagParamsConfig> {
    params_config: SetFlagParamsConfig;
    static type(): string;
    initialize_node(): void;
    process_event(event_context: EventContext<Event>): Promise<void>;
    private _update_node_flags;
    private _update_node_display_flag;
    private _update_node_bypass_flag;
    static PARAM_CALLBACK_execute(node: SetFlagEventNode): void;
}
export {};

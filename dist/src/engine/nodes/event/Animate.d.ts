import { TypedEventNode } from './_Base';
import { EventContext } from '../../scene/utils/events/_BaseEventsController';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class AnimateEventParamsConfig extends NodeParamsConfig {
    object: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.OPERATOR_PATH>;
    start: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BUTTON>;
    stop: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BUTTON>;
    animation: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.OPERATOR_PATH>;
}
export declare class AnimateEventNode extends TypedEventNode<AnimateEventParamsConfig> {
    params_config: AnimateEventParamsConfig;
    static type(): string;
    initialize_node(): void;
    process_event(event_context: EventContext<Event>): void;
    static PARAM_CALLBACK_start_animation(node: AnimateEventNode): void;
    static PARAM_CALLBACK_stop_animation(node: AnimateEventNode): void;
    private _start_animation;
    private _stop_animation;
    private _update_animation;
}
export {};

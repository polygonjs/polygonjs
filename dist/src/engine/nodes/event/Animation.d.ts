import { TypedEventNode } from './_Base';
import { EventContext } from '../../scene/utils/events/_BaseEventsController';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class AnimationEventParamsConfig extends NodeParamsConfig {
    object: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.OPERATOR_PATH>;
    start: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BUTTON>;
    stop: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BUTTON>;
    animation: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.OPERATOR_PATH>;
    loop: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
}
export declare class AnimationEventNode extends TypedEventNode<AnimationEventParamsConfig> {
    params_config: AnimationEventParamsConfig;
    static type(): string;
    private _resolved_anim_node;
    private _resolved_object_node;
    private _animation_mixer;
    private _animation_action;
    initialize_node(): void;
    cook(): void;
    process_event(event_context: EventContext<Event>): void;
    static PARAM_CALLBACK_start_animation(node: AnimationEventNode): void;
    static PARAM_CALLBACK_stop_animation(node: AnimationEventNode): void;
    private _start_time;
    private _start_animation;
    private _stop_animation;
    private _update_animation;
    private _update_animation_node;
    private _update_object_node;
    private _prepare_animation_mixer;
}
export {};

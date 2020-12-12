import { TypedEventNode } from './_Base';
import { EventContext } from '../../scene/utils/events/_BaseEventsController';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class AnimationEventParamsConfig extends NodeParamsConfig {
    animation: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.OPERATOR_PATH>;
    play: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BUTTON>;
    pause: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BUTTON>;
}
export declare class AnimationEventNode extends TypedEventNode<AnimationEventParamsConfig> {
    params_config: AnimationEventParamsConfig;
    static type(): string;
    private _timeline_builder;
    private _timeline;
    initialize_node(): void;
    process_event(event_context: EventContext<Event>): void;
    static PARAM_CALLBACK_play(node: AnimationEventNode): void;
    static PARAM_CALLBACK_pause(node: AnimationEventNode): void;
    private _play;
    private _pause;
    trigger_animation_started(event_context: EventContext<Event>): void;
    trigger_animation_completed(event_context: EventContext<Event>): void;
}
export {};

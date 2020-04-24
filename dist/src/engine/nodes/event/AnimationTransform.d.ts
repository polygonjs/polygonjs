import { TypedEventNode } from './_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { EventContext } from '../../scene/utils/events/_BaseEventsController';
declare class AnimationTransformEventParamsConfig extends NodeParamsConfig {
    animation_network: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.OPERATOR_PATH>;
    cache: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BUTTON>;
}
export declare class AnimationTransformEventNode extends TypedEventNode<AnimationTransformEventParamsConfig> {
    params_config: AnimationTransformEventParamsConfig;
    static type(): string;
    initialize_node(): void;
    process_event(event_context: EventContext<Event>): void;
    static PARAM_CALLBACK_cache(node: AnimationTransformEventNode): void;
    private cache;
    private _frame_range;
}
export {};

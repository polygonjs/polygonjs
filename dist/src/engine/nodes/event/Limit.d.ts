import { TypedEventNode } from './_Base';
import { EventContext } from '../../scene/utils/events/_BaseEventsController';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class LimitEventParamsConfig extends NodeParamsConfig {
    max_count: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    reset: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BUTTON>;
}
export declare class LimitEventNode extends TypedEventNode<LimitEventParamsConfig> {
    params_config: LimitEventParamsConfig;
    static type(): string;
    private _process_count;
    private _last_dispatched;
    initialize_node(): void;
    process_event(event_context: EventContext<Event>): void;
    private process_event_trigger;
    private process_event_reset;
    static PARAM_CALLBACK_reset(node: LimitEventNode): void;
}
export {};

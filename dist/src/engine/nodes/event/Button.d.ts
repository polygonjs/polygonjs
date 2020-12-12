import { TypedEventNode } from './_Base';
import { EventContext } from '../../scene/utils/events/_BaseEventsController';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class ButtonEventParamsConfig extends NodeParamsConfig {
    dispatch: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BUTTON>;
}
export declare class ButtonEventNode extends TypedEventNode<ButtonEventParamsConfig> {
    params_config: ButtonEventParamsConfig;
    static type(): string;
    initialize_node(): void;
    process_event(event_context: EventContext<Event>): void;
    private process_event_execute;
    static PARAM_CALLBACK_execute(node: ButtonEventNode): void;
}
export {};

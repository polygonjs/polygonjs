import { TypedEventNode } from './_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { EventContext } from '../../scene/utils/events/_BaseEventsController';
declare class PassEventParamsConfig extends NodeParamsConfig {
}
export declare class PassEventNode extends TypedEventNode<PassEventParamsConfig> {
    params_config: PassEventParamsConfig;
    static type(): string;
    initialize_node(): void;
    process_event(event_context: EventContext<Event>): void;
}
export {};

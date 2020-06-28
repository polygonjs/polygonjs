import { TypedEventNode } from './_Base';
import { EventContext } from '../../scene/utils/events/_BaseEventsController';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class NullEventParamsConfig extends NodeParamsConfig {
}
export declare class NullEventNode extends TypedEventNode<NullEventParamsConfig> {
    params_config: NullEventParamsConfig;
    static type(): string;
    initialize_node(): void;
    process_event(event_context: EventContext<Event>): void;
    private process_event_trigger;
}
export {};

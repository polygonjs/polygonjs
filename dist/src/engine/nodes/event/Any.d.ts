import { TypedEventNode } from './_Base';
import { EventContext } from '../../scene/utils/events/_BaseEventsController';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class AnyEventParamsConfig extends NodeParamsConfig {
    inputs_count: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
}
export declare class AnyEventNode extends TypedEventNode<AnyEventParamsConfig> {
    params_config: AnyEventParamsConfig;
    static type(): string;
    initialize_node(): void;
    private _expected_input_types;
    protected _input_name(index: number): string;
    process_event(event_context: EventContext<Event>): void;
}
export {};

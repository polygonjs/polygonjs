import { TypedEventNode } from './_Base';
import { EventContext } from '../../scene/utils/events/_BaseEventsController';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class PassEventParamsConfig extends NodeParamsConfig {
    outputs_count: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
}
export declare class SequenceEventNode extends TypedEventNode<PassEventParamsConfig> {
    params_config: PassEventParamsConfig;
    static type(): string;
    initialize_node(): void;
    private _expected_output_types;
    protected _output_name(index: number): string;
    process_event(event_context: EventContext<Event>): void;
}
export {};

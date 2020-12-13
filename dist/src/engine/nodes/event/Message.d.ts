import { TypedEventNode } from './_Base';
import { EventContext } from '../../scene/utils/events/_BaseEventsController';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class MessageParamsConfig extends NodeParamsConfig {
    alert: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    console: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
}
export declare class MessageEventNode extends TypedEventNode<MessageParamsConfig> {
    params_config: MessageParamsConfig;
    static type(): string;
    static readonly OUTPUT = "output";
    initialize_node(): void;
    trigger_output(context: EventContext<MouseEvent>): void;
    private _process_trigger_event;
}
export {};

import { TypedEventNode } from './_Base';
import { EventContext } from '../../scene/utils/events/_BaseEventsController';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class NodeCookEventParamsConfig extends NodeParamsConfig {
    node: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.OPERATOR_PATH>;
}
export declare class NodeCookEventNode extends TypedEventNode<NodeCookEventParamsConfig> {
    params_config: NodeCookEventParamsConfig;
    static type(): string;
    private _resolved_node;
    initialize_node(): void;
    process_event(event_context: EventContext<Event>): void;
    static PARAM_CALLBACK_update_node(node: NodeCookEventNode): void;
    private _update_node;
}
export {};

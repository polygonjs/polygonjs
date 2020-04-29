import { TypedNode } from '../_Base';
import { NodeContext } from '../../poly/NodeContext';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { EventContext } from '../../scene/utils/events/_BaseEventsController';
import { BaseEventConnectionPoint } from '../utils/io/connections/Event';
export declare class TypedEventNode<K extends NodeParamsConfig> extends TypedNode<NodeContext.EVENT, K> {
    static node_context(): NodeContext;
    private _eval_all_params_on_dirty_bound;
    initialize_base_node(): void;
    _eval_all_params_on_dirty(): void;
    process_event_via_connection_point(event_context: EventContext<Event>, connection_point: BaseEventConnectionPoint): void;
    process_event(event_context: EventContext<Event>): void;
    protected dispatch_event_to_output(output_name: string, event_context: EventContext<Event>): Promise<void>;
}
export declare type BaseEventNodeType = TypedEventNode<any>;
export declare class BaseEventNodeClass extends TypedEventNode<any> {
}

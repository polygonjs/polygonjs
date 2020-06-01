import { BaseManagerObjNode } from './_BaseManager';
import { NodeContext, NetworkNodeType } from '../../poly/NodeContext';
import { EventNodeChildrenMap } from '../../poly/registers/nodes/Event';
import { BaseEventNodeType } from '../event/_Base';
export declare class EventsObjNode extends BaseManagerObjNode {
    readonly render_order: number;
    static type(): NetworkNodeType;
    protected _children_controller_context: NodeContext;
    create_node<K extends keyof EventNodeChildrenMap>(type: K): EventNodeChildrenMap[K];
    children(): BaseEventNodeType[];
    nodes_by_type<K extends keyof EventNodeChildrenMap>(type: K): EventNodeChildrenMap[K][];
}

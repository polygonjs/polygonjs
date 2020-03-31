import { BaseManagerObjNode } from './_BaseManager';
import { NodeContext } from '../../poly/NodeContext';
import { EventNodeChildrenMap } from '../../poly/registers/Event';
import { BaseEventNodeType } from '../event/_Base';
export declare class EventsObjNode extends BaseManagerObjNode {
    readonly render_order: number;
    static type(): string;
    protected _children_controller_context: NodeContext;
    initialize_node(): void;
    create_node<K extends keyof EventNodeChildrenMap>(type: K): EventNodeChildrenMap[K];
    children(): BaseEventNodeType[];
    nodes_by_type<K extends keyof EventNodeChildrenMap>(type: K): EventNodeChildrenMap[K][];
}

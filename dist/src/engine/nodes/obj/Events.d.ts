import { ParamLessBaseManagerObjNode } from './_BaseManager';
import { NodeContext, NetworkNodeType } from '../../poly/NodeContext';
import { EventNodeChildrenMap } from '../../poly/registers/nodes/Event';
import { BaseEventNodeType } from '../event/_Base';
import { ParamsInitData } from '../utils/io/IOController';
export declare class EventsObjNode extends ParamLessBaseManagerObjNode {
    readonly render_order: number;
    static type(): NetworkNodeType;
    protected _children_controller_context: NodeContext;
    create_node<K extends keyof EventNodeChildrenMap>(type: K, params_init_value_overrides?: ParamsInitData): EventNodeChildrenMap[K];
    createNode<K extends valueof<EventNodeChildrenMap>>(node_class: Constructor<K>, params_init_value_overrides?: ParamsInitData): K;
    children(): BaseEventNodeType[];
    nodes_by_type<K extends keyof EventNodeChildrenMap>(type: K): EventNodeChildrenMap[K][];
}

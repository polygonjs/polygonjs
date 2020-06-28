import { BaseManagerObjNode } from './_BaseManager';
import { NodeContext, NetworkNodeType } from '../../poly/NodeContext';
import { CopNodeChildrenMap } from '../../poly/registers/nodes/Cop';
import { BaseCopNodeType } from '../cop/_Base';
import { ParamInitValueSerialized } from '../../params/types/ParamInitValueSerialized';
export declare class CopObjNode extends BaseManagerObjNode {
    static type(): NetworkNodeType;
    protected _children_controller_context: NodeContext;
    create_node<K extends keyof CopNodeChildrenMap>(type: K, params_init_value_overrides?: Dictionary<ParamInitValueSerialized>): CopNodeChildrenMap[K];
    children(): BaseCopNodeType[];
    nodes_by_type<K extends keyof CopNodeChildrenMap>(type: K): CopNodeChildrenMap[K][];
}

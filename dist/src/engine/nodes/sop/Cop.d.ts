import { ParamLessBaseNetworkSopNode } from './_Base';
import { NodeContext, NetworkNodeType } from '../../poly/NodeContext';
import { CopNodeChildrenMap } from '../../poly/registers/nodes/Cop';
import { BaseCopNodeType } from '../cop/_Base';
import { ParamsInitData } from '../utils/io/IOController';
export declare class CopSopNode extends ParamLessBaseNetworkSopNode {
    static type(): NetworkNodeType;
    protected _children_controller_context: NodeContext;
    createNode<S extends keyof CopNodeChildrenMap>(node_class: S, params_init_value_overrides?: ParamsInitData): CopNodeChildrenMap[S];
    createNode<K extends valueof<CopNodeChildrenMap>>(node_class: Constructor<K>, params_init_value_overrides?: ParamsInitData): K;
    children(): BaseCopNodeType[];
    nodes_by_type<K extends keyof CopNodeChildrenMap>(type: K): CopNodeChildrenMap[K][];
}

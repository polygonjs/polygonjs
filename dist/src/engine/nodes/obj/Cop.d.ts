import { ParamLessBaseManagerObjNode } from './_BaseManager';
import { NodeContext, NetworkNodeType } from '../../poly/NodeContext';
import { CopNodeChildrenMap } from '../../poly/registers/nodes/Cop';
import { BaseCopNodeType } from '../cop/_Base';
import { ParamsInitData } from '../utils/io/IOController';
export declare class CopObjNode extends ParamLessBaseManagerObjNode {
    static type(): NetworkNodeType;
    protected _children_controller_context: NodeContext;
    create_node<K extends keyof CopNodeChildrenMap>(type: K, params_init_value_overrides?: ParamsInitData): CopNodeChildrenMap[K];
    createNode<K extends valueof<CopNodeChildrenMap>>(node_class: Constructor<K>, params_init_value_overrides?: ParamsInitData): K;
    children(): BaseCopNodeType[];
    nodes_by_type<K extends keyof CopNodeChildrenMap>(type: K): CopNodeChildrenMap[K][];
}

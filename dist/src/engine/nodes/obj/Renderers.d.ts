import { ParamLessBaseManagerObjNode } from './_BaseManager';
import { NodeContext, NetworkNodeType } from '../../poly/NodeContext';
import { RopNodeChildrenMap } from '../../poly/registers/nodes/Rop';
import { BaseRopNodeType } from '../rop/_Base';
import { ParamsInitData } from '../utils/io/IOController';
export declare class RenderersObjNode extends ParamLessBaseManagerObjNode {
    readonly render_order: number;
    static type(): NetworkNodeType;
    protected _children_controller_context: NodeContext;
    create_node<K extends keyof RopNodeChildrenMap>(type: K, params_init_value_overrides?: ParamsInitData): RopNodeChildrenMap[K];
    createNode<K extends valueof<RopNodeChildrenMap>>(node_class: Constructor<K>, params_init_value_overrides?: ParamsInitData): K;
    children(): BaseRopNodeType[];
    nodes_by_type<K extends keyof RopNodeChildrenMap>(type: K): RopNodeChildrenMap[K][];
}

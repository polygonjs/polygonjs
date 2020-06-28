import { BaseManagerObjNode } from './_BaseManager';
import { NodeContext, NetworkNodeType } from '../../poly/NodeContext';
import { RopNodeChildrenMap } from '../../poly/registers/nodes/Rop';
import { BaseRopNodeType } from '../rop/_Base';
import { ParamInitValueSerialized } from '../../params/types/ParamInitValueSerialized';
export declare class RenderersObjNode extends BaseManagerObjNode {
    readonly render_order: number;
    static type(): NetworkNodeType;
    protected _children_controller_context: NodeContext;
    create_node<K extends keyof RopNodeChildrenMap>(type: K, params_init_value_overrides?: Dictionary<ParamInitValueSerialized>): RopNodeChildrenMap[K];
    children(): BaseRopNodeType[];
    nodes_by_type<K extends keyof RopNodeChildrenMap>(type: K): RopNodeChildrenMap[K][];
}

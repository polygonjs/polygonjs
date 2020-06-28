import { BaseManagerObjNode } from './_BaseManager';
import { NodeContext, NetworkNodeType } from '../../poly/NodeContext';
import { MatNodeChildrenMap } from '../../poly/registers/nodes/Mat';
import { BaseMatNodeType } from '../mat/_Base';
import { ParamInitValueSerialized } from '../../params/types/ParamInitValueSerialized';
export declare class MaterialsObjNode extends BaseManagerObjNode {
    readonly render_order: number;
    static type(): Readonly<NetworkNodeType.MAT>;
    protected _children_controller_context: NodeContext;
    create_node<K extends keyof MatNodeChildrenMap>(type: K, params_init_value_overrides?: Dictionary<ParamInitValueSerialized>): MatNodeChildrenMap[K];
    children(): BaseMatNodeType[];
    nodes_by_type<K extends keyof MatNodeChildrenMap>(type: K): MatNodeChildrenMap[K][];
}

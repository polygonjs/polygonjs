import { ParamLessBaseManagerObjNode } from './_BaseManager';
import { NodeContext, NetworkNodeType } from '../../poly/NodeContext';
import { MatNodeChildrenMap } from '../../poly/registers/nodes/Mat';
import { BaseMatNodeType } from '../mat/_Base';
import { ParamsInitData } from '../utils/io/IOController';
export declare class MaterialsObjNode extends ParamLessBaseManagerObjNode {
    readonly render_order: number;
    static type(): Readonly<NetworkNodeType.MAT>;
    protected _children_controller_context: NodeContext;
    createNode<S extends keyof MatNodeChildrenMap>(node_class: S, params_init_value_overrides?: ParamsInitData): MatNodeChildrenMap[S];
    createNode<K extends valueof<MatNodeChildrenMap>>(node_class: Constructor<K>, params_init_value_overrides?: ParamsInitData): K;
    children(): BaseMatNodeType[];
    nodes_by_type<K extends keyof MatNodeChildrenMap>(type: K): MatNodeChildrenMap[K][];
}

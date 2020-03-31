import { BaseManagerObjNode } from './_BaseManager';
import { NodeContext } from '../../poly/NodeContext';
import { MatNodeChildrenMap } from '../../poly/registers/Mat';
import { BaseMatNodeType } from '../mat/_Base';
export declare class MaterialsObjNode extends BaseManagerObjNode {
    readonly render_order: number;
    static type(): string;
    protected _children_controller_context: NodeContext;
    initialize_node(): void;
    create_node<K extends keyof MatNodeChildrenMap>(type: K): MatNodeChildrenMap[K];
    children(): BaseMatNodeType[];
    nodes_by_type<K extends keyof MatNodeChildrenMap>(type: K): MatNodeChildrenMap[K][];
}

import { BaseManagerObjNode } from './_BaseManager';
import { NodeContext } from '../../poly/NodeContext';
import { CopNodeChildrenMap } from '../../poly/registers/nodes/Cop';
import { BaseCopNodeType } from '../cop/_Base';
export declare class CopObjNode extends BaseManagerObjNode {
    static type(): string;
    protected _children_controller_context: NodeContext;
    initialize_node(): void;
    create_node<K extends keyof CopNodeChildrenMap>(type: K): CopNodeChildrenMap[K];
    children(): BaseCopNodeType[];
    nodes_by_type<K extends keyof CopNodeChildrenMap>(type: K): CopNodeChildrenMap[K][];
}

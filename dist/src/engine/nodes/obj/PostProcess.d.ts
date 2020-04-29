import { BaseManagerObjNode } from './_BaseManager';
import { NodeContext } from '../../poly/NodeContext';
import { PostNodeChildrenMap } from '../../poly/registers/nodes/Post';
import { BasePostProcessNodeType } from '../post/_Base';
export declare class PostProcessObjNode extends BaseManagerObjNode {
    static type(): string;
    protected _children_controller_context: NodeContext;
    initialize_node(): void;
    create_node<K extends keyof PostNodeChildrenMap>(type: K): PostNodeChildrenMap[K];
    children(): BasePostProcessNodeType[];
    nodes_by_type<K extends keyof PostNodeChildrenMap>(type: K): PostNodeChildrenMap[K][];
}

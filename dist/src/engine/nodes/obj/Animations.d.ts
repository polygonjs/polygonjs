import { BaseManagerObjNode } from './_BaseManager';
import { NodeContext, NetworkNodeType } from '../../poly/NodeContext';
import { AnimNodeChildrenMap } from '../../poly/registers/nodes/Anim';
import { BaseAnimNodeType } from '../anim/_Base';
export declare class AnimationsObjNode extends BaseManagerObjNode {
    readonly render_order: number;
    static type(): Readonly<NetworkNodeType.ANIM>;
    protected _children_controller_context: NodeContext;
    create_node<K extends keyof AnimNodeChildrenMap>(type: K): AnimNodeChildrenMap[K];
    children(): BaseAnimNodeType[];
    nodes_by_type<K extends keyof AnimNodeChildrenMap>(type: K): AnimNodeChildrenMap[K][];
}

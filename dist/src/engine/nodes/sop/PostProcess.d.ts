import { BaseNetworkSopNode } from './_Base';
import { NodeContext } from '../../poly/NodeContext';
import { PostNodeChildrenMap } from '../../poly/registers/nodes/Post';
import { BasePostProcessNodeType } from '../post/_Base';
import { DisplayNodeController } from '../utils/DisplayNodeController';
import { EffectsComposerController } from '../post/utils/EffectsComposerController';
export declare class PostProcessSopNode extends BaseNetworkSopNode {
    static type(): string;
    readonly effects_composer_controller: EffectsComposerController;
    readonly display_node_controller: DisplayNodeController;
    protected _children_controller_context: NodeContext;
    create_node<K extends keyof PostNodeChildrenMap>(type: K): PostNodeChildrenMap[K];
    children(): BasePostProcessNodeType[];
    nodes_by_type<K extends keyof PostNodeChildrenMap>(type: K): PostNodeChildrenMap[K][];
}

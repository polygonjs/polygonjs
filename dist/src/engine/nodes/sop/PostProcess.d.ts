import { BaseNetworkSopNode } from './_Base';
import { NodeContext } from '../../poly/NodeContext';
import { PostNodeChildrenMap } from '../../poly/registers/nodes/Post';
import { BasePostProcessNodeType } from '../post/_Base';
import { DisplayNodeController } from '../utils/DisplayNodeController';
import { EffectsComposerController, PostProcessNetworkParamsConfig } from '../post/utils/EffectsComposerController';
import { ParamsInitData } from '../utils/io/IOController';
export declare class PostProcessSopNode extends BaseNetworkSopNode<PostProcessNetworkParamsConfig> {
    params_config: PostProcessNetworkParamsConfig;
    static type(): string;
    readonly effects_composer_controller: EffectsComposerController;
    readonly display_node_controller: DisplayNodeController;
    protected _children_controller_context: NodeContext;
    createNode<S extends keyof PostNodeChildrenMap>(node_class: S, params_init_value_overrides?: ParamsInitData): PostNodeChildrenMap[S];
    createNode<K extends valueof<PostNodeChildrenMap>>(node_class: Constructor<K>, params_init_value_overrides?: ParamsInitData): K;
    children(): BasePostProcessNodeType[];
    nodes_by_type<K extends keyof PostNodeChildrenMap>(type: K): PostNodeChildrenMap[K][];
}

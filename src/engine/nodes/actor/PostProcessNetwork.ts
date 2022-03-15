/**
 * A subnet to create POST PROCESS nodes
 *
 */
import {Constructor, valueof} from '../../../types/GlobalTypes';
import {BaseNetworkActorNode} from './_BaseManager';
import {NetworkNodeType, NodeContext} from '../../poly/NodeContext';
import {PostNodeChildrenMap} from '../../poly/registers/nodes/Post';
import {BasePostProcessNodeType} from '../post/_Base';
import {DisplayNodeController} from '../utils/DisplayNodeController';
import {EffectsComposerController, PostProcessNetworkParamsConfig} from '../post/utils/EffectsComposerController';
import {NodeCreateOptions} from '../utils/hierarchy/ChildrenController';

export class PostProcessNetworkActorNode extends BaseNetworkActorNode<PostProcessNetworkParamsConfig> {
	override paramsConfig = new PostProcessNetworkParamsConfig();
	static override type() {
		return NetworkNodeType.POST;
	}
	readonly effectsComposerController: EffectsComposerController = new EffectsComposerController(this);
	public override readonly displayNodeController: DisplayNodeController = new DisplayNodeController(
		this,
		this.effectsComposerController.displayNodeControllerCallbacks()
	);

	protected override _childrenControllerContext = NodeContext.POST;

	override createNode<S extends keyof PostNodeChildrenMap>(
		node_class: S,
		options?: NodeCreateOptions
	): PostNodeChildrenMap[S];
	override createNode<K extends valueof<PostNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K;
	override createNode<K extends valueof<PostNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K {
		return super.createNode(node_class, options) as K;
	}
	override children() {
		return super.children() as BasePostProcessNodeType[];
	}
	override nodesByType<K extends keyof PostNodeChildrenMap>(type: K): PostNodeChildrenMap[K][] {
		return super.nodesByType(type) as PostNodeChildrenMap[K][];
	}
}

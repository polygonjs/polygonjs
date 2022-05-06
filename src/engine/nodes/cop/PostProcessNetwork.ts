/**
 * A subnet to create POST PROCESS nodes
 *
 */
import {Constructor, valueof} from '../../../types/GlobalTypes';
import {BaseNetworkCopNode} from './_BaseManager';
import {NetworkNodeType, NodeContext} from '../../poly/NodeContext';
import {PostNodeChildrenMap} from '../../poly/registers/nodes/Post';
import {BasePostProcessNodeType} from '../post/_Base';
import {DisplayNodeController} from '../utils/DisplayNodeController';
import {EffectComposerController, PostProcessNetworkParamsConfig} from '../post/utils/EffectComposerController';
import {NodeCreateOptions} from '../utils/hierarchy/ChildrenController';

export class PostProcessNetworkCopNode extends BaseNetworkCopNode<PostProcessNetworkParamsConfig> {
	override paramsConfig = new PostProcessNetworkParamsConfig();
	static override type() {
		return NetworkNodeType.POST;
	}
	readonly effectsComposerController: EffectComposerController = new EffectComposerController(this);
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

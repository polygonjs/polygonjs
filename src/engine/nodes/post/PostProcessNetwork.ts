/**
 * A subnet to create POST PROCESS nodes
 *
 */
import {Constructor, valueof} from '../../../types/GlobalTypes';
import {BaseNetworkPostNode} from './_BaseManager';
import {NetworkNodeType, NodeContext} from '../../poly/NodeContext';
import {PostNodeChildrenMap} from '../../poly/registers/nodes/Post';
import {BasePostProcessNodeType} from './_Base';
import {DisplayNodeController} from '../utils/DisplayNodeController';
import {EffectsComposerController, PostProcessNetworkParamsConfig} from './utils/EffectsComposerController';
import {NodeCreateOptions} from '../utils/hierarchy/ChildrenController';

export class PostProcessNetworkPostNode extends BaseNetworkPostNode<PostProcessNetworkParamsConfig> {
	paramsConfig = new PostProcessNetworkParamsConfig();
	static type() {
		return NetworkNodeType.POST;
	}
	readonly effectsComposerController: EffectsComposerController = new EffectsComposerController(this);
	public readonly displayNodeController: DisplayNodeController = new DisplayNodeController(
		this,
		this.effectsComposerController.displayNodeControllerCallbacks()
	);

	protected _childrenControllerContext = NodeContext.POST;

	createNode<S extends keyof PostNodeChildrenMap>(node_class: S, options?: NodeCreateOptions): PostNodeChildrenMap[S];
	createNode<K extends valueof<PostNodeChildrenMap>>(node_class: Constructor<K>, options?: NodeCreateOptions): K;
	createNode<K extends valueof<PostNodeChildrenMap>>(node_class: Constructor<K>, options?: NodeCreateOptions): K {
		return super.createNode(node_class, options) as K;
	}
	children() {
		return super.children() as BasePostProcessNodeType[];
	}
	nodesByType<K extends keyof PostNodeChildrenMap>(type: K): PostNodeChildrenMap[K][] {
		return super.nodesByType(type) as PostNodeChildrenMap[K][];
	}
}

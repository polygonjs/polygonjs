/**
 * A subnet to create actor nodes
 *
 */

import {ParamLessBaseNetworkActorNode} from './_BaseManager';
import {NodeContext, NetworkNodeType} from '../../poly/NodeContext';
import {ActorNodeChildrenMap} from '../../poly/registers/nodes/Actor';
import {BaseAnimNodeType} from '../anim/_Base';
import {Constructor, valueof} from '../../../types/GlobalTypes';
import {NodeCreateOptions} from '../utils/hierarchy/ChildrenController';

export class ActorsNetworkActorNode extends ParamLessBaseNetworkActorNode {
	static override type() {
		return NetworkNodeType.ACTOR;
	}

	protected override _childrenControllerContext = NodeContext.ACTOR;

	override createNode<S extends keyof ActorNodeChildrenMap>(
		node_class: S,
		options?: NodeCreateOptions
	): ActorNodeChildrenMap[S];
	override createNode<K extends valueof<ActorNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K;
	override createNode<K extends valueof<ActorNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K {
		return super.createNode(node_class, options) as K;
	}
	override children() {
		return super.children() as BaseAnimNodeType[];
	}
	override nodesByType<K extends keyof ActorNodeChildrenMap>(type: K): ActorNodeChildrenMap[K][] {
		return super.nodesByType(type) as ActorNodeChildrenMap[K][];
	}
}

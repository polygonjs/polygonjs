/**
 * A subnet to create EVENT nodes
 *
 */
import {ParamLessBaseNetworkSopNode} from './_BaseManager';
import {NodeContext, NetworkNodeType} from '../../poly/NodeContext';
import {EventNodeChildrenMap} from '../../poly/registers/nodes/Event';
import {BaseEventNodeType} from '../event/_Base';
import {Constructor, valueof} from '../../../types/GlobalTypes';
import {NodeCreateOptions} from '../utils/hierarchy/ChildrenController';

export class EventsNetworkSopNode extends ParamLessBaseNetworkSopNode {
	static override type() {
		return NetworkNodeType.EVENT;
	}

	protected override _childrenControllerContext = NodeContext.EVENT;

	override createNode<S extends keyof EventNodeChildrenMap>(
		node_class: S,
		options?: NodeCreateOptions
	): EventNodeChildrenMap[S];
	override createNode<K extends valueof<EventNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K;
	override createNode<K extends valueof<EventNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K {
		return super.createNode(node_class, options) as K;
	}
	override children() {
		return super.children() as BaseEventNodeType[];
	}
	override nodesByType<K extends keyof EventNodeChildrenMap>(type: K): EventNodeChildrenMap[K][] {
		return super.nodesByType(type) as EventNodeChildrenMap[K][];
	}
}

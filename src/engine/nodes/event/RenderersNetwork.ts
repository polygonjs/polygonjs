/**
 * A subnet to create ROP nodes
 *
 */
import {Constructor, valueof} from '../../../types/GlobalTypes';
import {ParamLessBaseNetworkEventNode} from './_BaseManager';
import {NodeContext, NetworkNodeType} from '../../poly/NodeContext';
import {RopNodeChildrenMap} from '../../poly/registers/nodes/Rop';
import {BaseRopNodeType} from '../rop/_Base';
import {NodeCreateOptions} from '../utils/hierarchy/ChildrenController';

export class RenderersNetworkEventNode extends ParamLessBaseNetworkEventNode {
	static override type() {
		return NetworkNodeType.ROP;
	}

	protected override _childrenControllerContext = NodeContext.ROP;

	override createNode<S extends keyof RopNodeChildrenMap>(
		node_class: S,
		options?: NodeCreateOptions
	): RopNodeChildrenMap[S];
	override createNode<K extends valueof<RopNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K;
	override createNode<K extends valueof<RopNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K {
		return super.createNode(node_class, options) as K;
	}
	override children() {
		return super.children() as BaseRopNodeType[];
	}
	override nodesByType<K extends keyof RopNodeChildrenMap>(type: K): RopNodeChildrenMap[K][] {
		return super.nodesByType(type) as RopNodeChildrenMap[K][];
	}
}

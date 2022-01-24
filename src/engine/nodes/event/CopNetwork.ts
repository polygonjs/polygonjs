/**
 * A subnet to create COP nodes
 *
 */

import {ParamLessBaseNetworkEventNode} from './_BaseManager';
import {NodeContext, NetworkNodeType} from '../../poly/NodeContext';
import {CopNodeChildrenMap} from '../../poly/registers/nodes/Cop';
import {BaseCopNodeType} from '../cop/_Base';
import {Constructor, valueof} from '../../../types/GlobalTypes';
import {NodeCreateOptions} from '../utils/hierarchy/ChildrenController';

export class CopNetworkEventNode extends ParamLessBaseNetworkEventNode {
	static override type() {
		return NetworkNodeType.COP;
	}

	protected override _childrenControllerContext = NodeContext.COP;

	override createNode<S extends keyof CopNodeChildrenMap>(
		node_class: S,
		options?: NodeCreateOptions
	): CopNodeChildrenMap[S];
	override createNode<K extends valueof<CopNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K;
	override createNode<K extends valueof<CopNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K {
		return super.createNode(node_class, options) as K;
	}
	override children() {
		return super.children() as BaseCopNodeType[];
	}
	override nodesByType<K extends keyof CopNodeChildrenMap>(type: K): CopNodeChildrenMap[K][] {
		return super.nodesByType(type) as CopNodeChildrenMap[K][];
	}
}

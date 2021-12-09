/**
 * A subnet to create ROP nodes
 *
 */
import {Constructor, valueof} from '../../../types/GlobalTypes';
import {ParamLessBaseNetworkRopNode} from './_BaseManager';
import {NodeContext, NetworkNodeType} from '../../poly/NodeContext';
import {RopNodeChildrenMap} from '../../poly/registers/nodes/Rop';
import {BaseRopNodeType} from './_Base';
import {NodeCreateOptions} from '../utils/hierarchy/ChildrenController';

export class RenderersNetworkRopNode extends ParamLessBaseNetworkRopNode {
	static type() {
		return NetworkNodeType.ROP;
	}

	protected _childrenControllerContext = NodeContext.ROP;

	createNode<S extends keyof RopNodeChildrenMap>(node_class: S, options?: NodeCreateOptions): RopNodeChildrenMap[S];
	createNode<K extends valueof<RopNodeChildrenMap>>(node_class: Constructor<K>, options?: NodeCreateOptions): K;
	createNode<K extends valueof<RopNodeChildrenMap>>(node_class: Constructor<K>, options?: NodeCreateOptions): K {
		return super.createNode(node_class, options) as K;
	}
	children() {
		return super.children() as BaseRopNodeType[];
	}
	nodesByType<K extends keyof RopNodeChildrenMap>(type: K): RopNodeChildrenMap[K][] {
		return super.nodesByType(type) as RopNodeChildrenMap[K][];
	}
}

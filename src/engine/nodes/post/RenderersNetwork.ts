/**
 * A subnet to create ROP nodes
 *
 */
import {Constructor, valueof} from '../../../types/GlobalTypes';
import {ParamLessBaseNetworkPostNode} from './_BaseManager';
import {NodeContext, NetworkNodeType} from '../../poly/NodeContext';
import {RopNodeChildrenMap} from '../../poly/registers/nodes/Rop';
import {BaseRopNodeType} from '../rop/_Base';
import {NodeCreateOptions} from '../utils/hierarchy/ChildrenController';

export class RenderersNetworkPostNode extends ParamLessBaseNetworkPostNode {
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

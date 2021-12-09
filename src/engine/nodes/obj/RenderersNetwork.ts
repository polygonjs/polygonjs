/**
 * Parent for Renderer nodes
 *
 *
 */
import {Constructor, valueof} from '../../../types/GlobalTypes';
import {ParamLessBaseManagerObjNode} from './_BaseManager';
import {NodeContext, NetworkNodeType} from '../../poly/NodeContext';
import {ObjNodeRenderOrder} from './_Base';
import {RopNodeChildrenMap} from '../../poly/registers/nodes/Rop';
import {BaseRopNodeType} from '../rop/_Base';
import {NodeCreateOptions} from '../utils/hierarchy/ChildrenController';

export class RenderersNetworkObjNode extends ParamLessBaseManagerObjNode {
	public readonly renderOrder: number = ObjNodeRenderOrder.MANAGER;
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

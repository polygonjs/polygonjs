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
	public override readonly renderOrder: number = ObjNodeRenderOrder.MANAGER;
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

/**
 * Parent for Material nodes
 *
 *
 */
import {Constructor, valueof} from '../../../types/GlobalTypes';
import {ParamLessBaseManagerObjNode} from './_BaseManager';
import {NodeContext, NetworkNodeType} from '../../poly/NodeContext';
import {ObjNodeRenderOrder} from './_Base';
import {MatNodeChildrenMap} from '../../poly/registers/nodes/Mat';
import {BaseMatNodeType} from '../mat/_Base';
import {NodeCreateOptions} from '../utils/hierarchy/ChildrenController';

export class MaterialsNetworkObjNode extends ParamLessBaseManagerObjNode {
	public override readonly renderOrder: number = ObjNodeRenderOrder.MANAGER;
	static override type(): Readonly<NetworkNodeType.MAT> {
		return NetworkNodeType.MAT;
	}

	protected override _childrenControllerContext = NodeContext.MAT;

	override createNode<S extends keyof MatNodeChildrenMap>(
		node_class: S,
		options?: NodeCreateOptions
	): MatNodeChildrenMap[S];
	override createNode<K extends valueof<MatNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K;
	override createNode<K extends valueof<MatNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K {
		return super.createNode(node_class, options) as K;
	}
	override children() {
		return super.children() as BaseMatNodeType[];
	}
	override nodesByType<K extends keyof MatNodeChildrenMap>(type: K): MatNodeChildrenMap[K][] {
		return super.nodesByType(type) as MatNodeChildrenMap[K][];
	}
}

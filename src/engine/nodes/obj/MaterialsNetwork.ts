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
import {ParamsInitData} from '../utils/io/IOController';

export class MaterialsNetworkObjNode extends ParamLessBaseManagerObjNode {
	public readonly renderOrder: number = ObjNodeRenderOrder.MANAGER;
	static type(): Readonly<NetworkNodeType.MAT> {
		return NetworkNodeType.MAT;
	}

	protected _children_controller_context = NodeContext.MAT;

	createNode<S extends keyof MatNodeChildrenMap>(
		node_class: S,
		params_init_value_overrides?: ParamsInitData
	): MatNodeChildrenMap[S];
	createNode<K extends valueof<MatNodeChildrenMap>>(
		node_class: Constructor<K>,
		params_init_value_overrides?: ParamsInitData
	): K;
	createNode<K extends valueof<MatNodeChildrenMap>>(
		node_class: Constructor<K>,
		params_init_value_overrides?: ParamsInitData
	): K {
		return super.createNode(node_class, params_init_value_overrides) as K;
	}
	children() {
		return super.children() as BaseMatNodeType[];
	}
	nodesByType<K extends keyof MatNodeChildrenMap>(type: K): MatNodeChildrenMap[K][] {
		return super.nodesByType(type) as MatNodeChildrenMap[K][];
	}
}

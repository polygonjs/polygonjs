import {ParamLessBaseManagerObjNode} from './_BaseManager';
import {NodeContext, NetworkNodeType} from '../../poly/NodeContext';
import {ObjNodeRenderOrder} from './_Base';
import {MatNodeChildrenMap} from '../../poly/registers/nodes/Mat';
import {BaseMatNodeType} from '../mat/_Base';
import {ParamsInitData} from '../utils/io/IOController';

export class MaterialsObjNode extends ParamLessBaseManagerObjNode {
	public readonly render_order: number = ObjNodeRenderOrder.MANAGER;
	static type(): Readonly<NetworkNodeType.MAT> {
		return NetworkNodeType.MAT;
	}

	protected _children_controller_context = NodeContext.MAT;

	create_node<K extends keyof MatNodeChildrenMap>(
		type: K,
		params_init_value_overrides?: ParamsInitData
	): MatNodeChildrenMap[K] {
		return super.create_node(type, params_init_value_overrides) as MatNodeChildrenMap[K];
	}
	children() {
		return super.children() as BaseMatNodeType[];
	}
	nodes_by_type<K extends keyof MatNodeChildrenMap>(type: K): MatNodeChildrenMap[K][] {
		return super.nodes_by_type(type) as MatNodeChildrenMap[K][];
	}
}

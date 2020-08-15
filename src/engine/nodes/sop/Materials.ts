import {ParamLessBaseNetworkSopNode} from './_Base';
import {NodeContext, NetworkNodeType} from '../../poly/NodeContext';
import {MatNodeChildrenMap} from '../../poly/registers/nodes/Mat';
import {BaseMatNodeType} from '../mat/_Base';
import {ParamsInitData} from '../utils/io/IOController';

export class MaterialsSopNode extends ParamLessBaseNetworkSopNode {
	static type() {
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

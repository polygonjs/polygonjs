import {ParamLessBaseNetworkSopNode} from './_Base';
import {NodeContext, NetworkNodeType} from '../../poly/NodeContext';
import {CopNodeChildrenMap} from '../../poly/registers/nodes/Cop';
import {BaseCopNodeType} from '../cop/_Base';
import {ParamsInitData} from '../utils/io/IOController';

export class CopSopNode extends ParamLessBaseNetworkSopNode {
	static type() {
		return NetworkNodeType.COP;
	}

	protected _children_controller_context = NodeContext.COP;

	createNode<S extends keyof CopNodeChildrenMap>(
		node_class: S,
		params_init_value_overrides?: ParamsInitData
	): CopNodeChildrenMap[S];
	createNode<K extends valueof<CopNodeChildrenMap>>(
		node_class: Constructor<K>,
		params_init_value_overrides?: ParamsInitData
	): K;
	createNode<K extends valueof<CopNodeChildrenMap>>(
		node_class: Constructor<K>,
		params_init_value_overrides?: ParamsInitData
	): K {
		return super.createNode(node_class, params_init_value_overrides) as K;
	}
	children() {
		return super.children() as BaseCopNodeType[];
	}
	nodes_by_type<K extends keyof CopNodeChildrenMap>(type: K): CopNodeChildrenMap[K][] {
		return super.nodes_by_type(type) as CopNodeChildrenMap[K][];
	}
}

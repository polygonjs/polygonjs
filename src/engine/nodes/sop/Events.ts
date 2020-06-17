import {BaseNetworkSopNode} from './_Base';
import {NodeContext, NetworkNodeType} from '../../poly/NodeContext';
import {EventNodeChildrenMap} from '../../poly/registers/nodes/Event';
import {BaseEventNodeType} from '../event/_Base';
import {ParamInitValueSerialized} from '../../params/types/ParamInitValueSerialized';

export class EventsSopNode extends BaseNetworkSopNode {
	static type() {
		return NetworkNodeType.EVENT;
	}

	protected _children_controller_context = NodeContext.EVENT;

	create_node<K extends keyof EventNodeChildrenMap>(
		type: K,
		params_init_value_overrides?: Dictionary<ParamInitValueSerialized>
	): EventNodeChildrenMap[K] {
		return super.create_node(type, params_init_value_overrides) as EventNodeChildrenMap[K];
	}
	children() {
		return super.children() as BaseEventNodeType[];
	}
	nodes_by_type<K extends keyof EventNodeChildrenMap>(type: K): EventNodeChildrenMap[K][] {
		return super.nodes_by_type(type) as EventNodeChildrenMap[K][];
	}
}

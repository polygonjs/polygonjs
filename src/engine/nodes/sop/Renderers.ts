import {BaseNetworkSopNode} from './_Base';
import {NodeContext, NetworkNodeType} from '../../poly/NodeContext';
import {RopNodeChildrenMap} from '../../poly/registers/nodes/Rop';
import {BaseRopNodeType} from '../rop/_Base';
import {ParamsInitData} from '../utils/io/IOController';

export class RenderersSopNode extends BaseNetworkSopNode {
	static type() {
		return NetworkNodeType.ROP;
	}

	protected _children_controller_context = NodeContext.ROP;

	create_node<K extends keyof RopNodeChildrenMap>(
		type: K,
		params_init_value_overrides?: ParamsInitData
	): RopNodeChildrenMap[K] {
		return super.create_node(type, params_init_value_overrides) as RopNodeChildrenMap[K];
	}
	children() {
		return super.children() as BaseRopNodeType[];
	}
	nodes_by_type<K extends keyof RopNodeChildrenMap>(type: K): RopNodeChildrenMap[K][] {
		return super.nodes_by_type(type) as RopNodeChildrenMap[K][];
	}
}

import {ParamLessBaseNetworkSopNode} from './_Base';
import {NodeContext, NetworkNodeType} from '../../poly/NodeContext';
import {RopNodeChildrenMap} from '../../poly/registers/nodes/Rop';
import {BaseRopNodeType} from '../rop/_Base';
import {ParamsInitData} from '../utils/io/IOController';

export class RenderersSopNode extends ParamLessBaseNetworkSopNode {
	static type() {
		return NetworkNodeType.ROP;
	}

	protected _children_controller_context = NodeContext.ROP;

	createNode<S extends keyof RopNodeChildrenMap>(
		node_class: S,
		params_init_value_overrides?: ParamsInitData
	): RopNodeChildrenMap[S];
	createNode<K extends valueof<RopNodeChildrenMap>>(
		node_class: Constructor<K>,
		params_init_value_overrides?: ParamsInitData
	): K;
	createNode<K extends valueof<RopNodeChildrenMap>>(
		node_class: Constructor<K>,
		params_init_value_overrides?: ParamsInitData
	): K {
		return super.createNode(node_class, params_init_value_overrides) as K;
	}
	children() {
		return super.children() as BaseRopNodeType[];
	}
	nodes_by_type<K extends keyof RopNodeChildrenMap>(type: K): RopNodeChildrenMap[K][] {
		return super.nodes_by_type(type) as RopNodeChildrenMap[K][];
	}
}

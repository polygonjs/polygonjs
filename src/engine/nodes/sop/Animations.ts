import {ParamLessBaseNetworkSopNode} from './_Base';
import {NodeContext, NetworkNodeType} from '../../poly/NodeContext';
import {AnimNodeChildrenMap} from '../../poly/registers/nodes/Anim';
import {BaseAnimNodeType} from '../anim/_Base';
import {ParamsInitData} from '../utils/io/IOController';

export class AnimationsSopNode extends ParamLessBaseNetworkSopNode {
	static type() {
		return NetworkNodeType.ANIM;
	}

	protected _children_controller_context = NodeContext.ANIM;

	create_node<K extends keyof AnimNodeChildrenMap>(
		type: K,
		params_init_value_overrides?: ParamsInitData
	): AnimNodeChildrenMap[K] {
		return super.create_node(type, params_init_value_overrides) as AnimNodeChildrenMap[K];
	}
	createNode<K extends valueof<AnimNodeChildrenMap>>(
		node_class: Constructor<K>,
		params_init_value_overrides?: ParamsInitData
	): K {
		return super.createNode(node_class, params_init_value_overrides) as K;
	}
	children() {
		return super.children() as BaseAnimNodeType[];
	}
	nodes_by_type<K extends keyof AnimNodeChildrenMap>(type: K): AnimNodeChildrenMap[K][] {
		return super.nodes_by_type(type) as AnimNodeChildrenMap[K][];
	}
}

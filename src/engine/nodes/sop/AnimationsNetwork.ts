/**
 * A subnet to create animation nodes
 *
 */

import {ParamLessBaseNetworkSopNode} from './_BaseManager';
import {NodeContext, NetworkNodeType} from '../../poly/NodeContext';
import {AnimNodeChildrenMap} from '../../poly/registers/nodes/Anim';
import {BaseAnimNodeType} from '../anim/_Base';
import {ParamsInitData} from '../utils/io/IOController';
import {Constructor, valueof} from '../../../types/GlobalTypes';

export class AnimationsNetworkSopNode extends ParamLessBaseNetworkSopNode {
	static type() {
		return NetworkNodeType.ANIM;
	}

	protected _children_controller_context = NodeContext.ANIM;

	createNode<S extends keyof AnimNodeChildrenMap>(
		node_class: S,
		params_init_value_overrides?: ParamsInitData
	): AnimNodeChildrenMap[S];
	createNode<K extends valueof<AnimNodeChildrenMap>>(
		node_class: Constructor<K>,
		params_init_value_overrides?: ParamsInitData
	): K;
	createNode<K extends valueof<AnimNodeChildrenMap>>(
		node_class: Constructor<K>,
		params_init_value_overrides?: ParamsInitData
	): K {
		return super.createNode(node_class, params_init_value_overrides) as K;
	}
	children() {
		return super.children() as BaseAnimNodeType[];
	}
	nodesByType<K extends keyof AnimNodeChildrenMap>(type: K): AnimNodeChildrenMap[K][] {
		return super.nodesByType(type) as AnimNodeChildrenMap[K][];
	}
}

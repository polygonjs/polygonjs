/**
 * Parent for animation nodes
 *
 *
 */
import {Constructor, valueof} from '../../../types/GlobalTypes';
import {ParamLessBaseManagerObjNode} from './_BaseManager';
import {NodeContext, NetworkNodeType} from '../../poly/NodeContext';
import {ObjNodeRenderOrder} from './_Base';
import {AnimNodeChildrenMap} from '../../poly/registers/nodes/Anim';
import {BaseAnimNodeType} from '../anim/_Base';
import {ParamsInitData} from '../utils/io/IOController';

export class AnimationsObjNode extends ParamLessBaseManagerObjNode {
	public readonly render_order: number = ObjNodeRenderOrder.MANAGER;
	static type(): Readonly<NetworkNodeType.ANIM> {
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
	createNode<S extends keyof AnimNodeChildrenMap, K extends valueof<AnimNodeChildrenMap>>(
		node_class: S | Constructor<K>,
		params_init_value_overrides?: ParamsInitData
	): K | AnimNodeChildrenMap[S] {
		return super.createNode(node_class, params_init_value_overrides) as K | AnimNodeChildrenMap[S];
	}
	children() {
		return super.children() as BaseAnimNodeType[];
	}
	nodesByType<K extends keyof AnimNodeChildrenMap>(type: K): AnimNodeChildrenMap[K][] {
		return super.nodesByType(type) as AnimNodeChildrenMap[K][];
	}
}

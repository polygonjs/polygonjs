/**
 * Parent for Renderer nodes
 *
 *
 */
import {Constructor, valueof} from '../../../types/GlobalTypes';
import {ParamLessBaseManagerObjNode} from './_BaseManager';
import {NodeContext, NetworkNodeType} from '../../poly/NodeContext';
import {ObjNodeRenderOrder} from './_Base';
import {RopNodeChildrenMap} from '../../poly/registers/nodes/Rop';
import {BaseRopNodeType} from '../rop/_Base';
import {ParamsInitData} from '../utils/io/IOController';

export class RenderersNetworkObjNode extends ParamLessBaseManagerObjNode {
	public readonly renderOrder: number = ObjNodeRenderOrder.MANAGER;
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
	nodesByType<K extends keyof RopNodeChildrenMap>(type: K): RopNodeChildrenMap[K][] {
		return super.nodesByType(type) as RopNodeChildrenMap[K][];
	}
}

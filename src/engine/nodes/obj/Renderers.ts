/**
 * Parent for Renderer nodes
 *
 *
 */
import {ParamLessBaseManagerObjNode} from './_BaseManager';
import {NodeContext, NetworkNodeType} from '../../poly/NodeContext';
import {ObjNodeRenderOrder} from './_Base';
import {RopNodeChildrenMap} from '../../poly/registers/nodes/Rop';
import {BaseRopNodeType} from '../rop/_Base';
import {ParamsInitData} from '../utils/io/IOController';

export class RenderersObjNode extends ParamLessBaseManagerObjNode {
	public readonly render_order: number = ObjNodeRenderOrder.MANAGER;
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

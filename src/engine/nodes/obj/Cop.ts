/**
 * Parent for COP nodes
 *
 *
 */
import {ParamLessBaseManagerObjNode} from './_BaseManager';
import {NodeContext, NetworkNodeType} from '../../poly/NodeContext';
import {CopNodeChildrenMap} from '../../poly/registers/nodes/Cop';
import {BaseCopNodeType} from '../cop/_Base';
import {ParamsInitData} from '../utils/io/IOController';

export class CopObjNode extends ParamLessBaseManagerObjNode {
	static type() {
		return NetworkNodeType.COP;
	}
	// children_context(){ return NodeContext.COP }

	protected _children_controller_context = NodeContext.COP;
	// initialize_node() {
	// 	this.children_controller?.init({dependent: false});
	// 	// this._init_manager();
	// }

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

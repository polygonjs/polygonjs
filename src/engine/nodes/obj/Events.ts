import {ParamLessBaseManagerObjNode} from './_BaseManager';
import {NodeContext, NetworkNodeType} from '../../poly/NodeContext';
import {ObjNodeRenderOrder} from './_Base';
import {EventNodeChildrenMap} from '../../poly/registers/nodes/Event';
import {BaseEventNodeType} from '../event/_Base';
import {ParamsInitData} from '../utils/io/IOController';

export class EventsObjNode extends ParamLessBaseManagerObjNode {
	public readonly render_order: number = ObjNodeRenderOrder.MANAGER;
	static type() {
		return NetworkNodeType.EVENT;
	}

	protected _children_controller_context = NodeContext.EVENT;
	// initialize_node() {
	// 	this.children_controller?.init({dependent: false});
	// }

	create_node<K extends keyof EventNodeChildrenMap>(
		type: K,
		params_init_value_overrides?: ParamsInitData
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

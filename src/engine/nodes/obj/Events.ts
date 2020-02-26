import {BaseManagerObjNode} from './_BaseManager';
import {NodeContext} from '../../poly/NodeContext';
import {ObjNodeRenderOrder} from './_Base';
import {EventNodeChildrenMap} from '../../poly/registers/Event';
import {BaseEventNodeType} from '../event/_Base';

export class EventsObjNode extends BaseManagerObjNode {
	public readonly render_order: number = ObjNodeRenderOrder.EVENT;
	static type() {
		return 'events';
	}

	protected _children_controller_context = NodeContext.EVENT;
	initialize_node() {
		this.children_controller?.init();
	}

	create_node<K extends keyof EventNodeChildrenMap>(type: K): EventNodeChildrenMap[K] {
		return super.create_node(type) as EventNodeChildrenMap[K];
	}
	children() {
		return super.children() as BaseEventNodeType[];
	}
	nodes_by_type<K extends keyof EventNodeChildrenMap>(type: K): EventNodeChildrenMap[K][] {
		return super.nodes_by_type(type) as EventNodeChildrenMap[K][];
	}
}

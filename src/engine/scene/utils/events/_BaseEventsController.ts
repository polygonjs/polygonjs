import {BaseEventNodeType} from '../../../nodes/event/_Base';
import {BaseCameraObjNodeType} from '../../../nodes/obj/_BaseCamera';

export interface EventContext<E extends Event> {
	event: Readonly<E>;
	canvas: Readonly<HTMLCanvasElement>;
	camera_node: Readonly<BaseCameraObjNodeType>;
}

export abstract class BaseEventsController<E extends Event, T extends BaseEventNodeType> {
	protected _nodes_by_graph_node_id: Map<string, T> = new Map();
	register_node(node: T) {
		this._nodes_by_graph_node_id.set(node.graph_node_id, node);
	}
	unregister_node(node: T) {
		this._nodes_by_graph_node_id.delete(node.graph_node_id);
	}
	abstract accepts_event(event: Event): boolean;
	process(event_context: EventContext<E>) {
		this._nodes_by_graph_node_id.forEach((node) => node.process_event(event_context));
	}
}

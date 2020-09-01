import {BaseCameraObjNodeType} from '../../../nodes/obj/_BaseCamera';
import {BaseInputEventNodeType} from '../../../nodes/event/_BaseInput';
import {SceneEventsDispatcher} from './EventsDispatcher';
import {BaseNodeType} from '../../../nodes/_Base';
import {Intersection} from 'three/src/core/Raycaster';
import {CoreGraphNodeId} from '../../../../core/graph/CoreGraph';

interface EventContextValue {
	node?: BaseNodeType; // for node_cook
	intersect?: Intersection; // for raycast
}

export interface EventContext<E extends Event> {
	event?: Readonly<E>;
	canvas?: Readonly<HTMLCanvasElement>;
	camera_node?: Readonly<BaseCameraObjNodeType>;
	value?: EventContextValue;
}

export abstract class BaseSceneEventsController<E extends Event, T extends BaseInputEventNodeType> {
	protected _nodes_by_graph_node_id: Map<CoreGraphNodeId, T> = new Map();
	protected _require_canvas_event_listeners: boolean = false;
	constructor(private dispatcher: SceneEventsDispatcher) {}

	register_node(node: T) {
		this._nodes_by_graph_node_id.set(node.graph_node_id, node);
		this.update_viewer_event_listeners();
	}
	unregister_node(node: T) {
		this._nodes_by_graph_node_id.delete(node.graph_node_id);
		this.update_viewer_event_listeners();
	}
	abstract type(): string;
	abstract accepted_event_types(): string[];
	// abstract accepts_event(event: Event): boolean;

	process_event(event_context: EventContext<E>) {
		if (this._active_event_types.length == 0) {
			return;
		}
		this._nodes_by_graph_node_id.forEach((node) => node.process_event(event_context));
	}

	update_viewer_event_listeners() {
		this._update_active_event_types();

		if (this._require_canvas_event_listeners) {
			this.dispatcher.scene.viewers_register.traverse_viewers((viewer) => {
				viewer.events_controller.update_events(this);
			});
		}
	}

	private _active_event_types: string[] = [];
	active_event_types() {
		return this._active_event_types;
	}
	private _update_active_event_types() {
		const active_node_event_types_state: Map<string, boolean> = new Map();

		this._nodes_by_graph_node_id.forEach((node) => {
			if (node.parent) {
				const node_active_event_names = node.active_event_names();
				for (let name of node_active_event_names) {
					active_node_event_types_state.set(name, true);
				}
			}
		});
		this._active_event_types = [];
		active_node_event_types_state.forEach((state, name) => {
			this._active_event_types.push(name);
		});
	}
}

export type BaseSceneEventsControllerType = BaseSceneEventsController<Event, BaseInputEventNodeType>;
export class BaseSceneEventsControllerClass extends BaseSceneEventsController<Event, BaseInputEventNodeType> {
	type() {
		return '';
	}
	accepted_event_types(): string[] {
		return [];
	}
}

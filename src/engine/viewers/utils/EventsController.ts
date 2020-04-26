import {BaseViewerType} from '../_Base';
import {EventContext, BaseSceneEventsControllerType} from '../../scene/utils/events/_BaseEventsController';
// import {SceneEventsDispatcher} from '../../scene/utils/events/EventsDispatcher';

// type MouseOrTouchEvent = MouseEvent | TouchEvent;
// type MouseOrTouchEventCallback = (e: MouseEvent) => void;
type EventListener = (e: Event) => void;
type ListenerByEventType = Map<string, EventListener>;

export class ViewerEventsController {
	protected _bound_process_event = this.process_event.bind(this);
	protected _bound_listener_map_by_event_controller_type: Map<string, ListenerByEventType> = new Map();
	// protected _registered_events: Map<string, EventCallback> = new Map();
	// protected _bound_on_mousedown: MouseOrTouchEventCallback = this.process_event.bind(this);
	// protected _bound_on_mousemove: MouseOrTouchEventCallback = this.process_event.bind(this);
	// protected _bound_on_mouseup: MouseOrTouchEventCallback = this.process_event.bind(this);

	constructor(protected viewer: BaseViewerType) {}

	update_events(events_controller: BaseSceneEventsControllerType) {
		if (!this.canvas) {
			return;
		}
		const controller_type = events_controller.type();
		let map = this._bound_listener_map_by_event_controller_type.get(controller_type);
		if (!map) {
			map = new Map();
			this._bound_listener_map_by_event_controller_type.set(controller_type, map);
		}
		map.forEach((listener, event_type) => {
			this.canvas?.removeEventListener(event_type, listener);
			map?.delete(event_type);
		});

		const listener = (event: Event) => {
			this.process_event(event, events_controller);
		};
		for (let event_type of events_controller.active_event_types()) {
			this.canvas.addEventListener(event_type, listener);
			map.set(event_type, listener);
		}
	}

	get camera_node() {
		return this.viewer.cameras_controller.camera_node;
	}
	get canvas() {
		return this.viewer.canvas;
	}

	init() {
		if (!this.canvas) {
			return;
		}
		this.viewer.scene.events_dispatcher.traverse_controllers((controller) => {
			this.update_events(controller);
		});
	}

	registered_event_types(): string[] {
		const list: string[] = [];
		this._bound_listener_map_by_event_controller_type.forEach((map) => {
			map.forEach((listener, event_type) => {
				list.push(event_type);
			});
		});
		return list;
	}

	dispose() {
		this._bound_listener_map_by_event_controller_type.forEach((map) => {
			map.forEach((listener, event_type) => {
				this.canvas?.removeEventListener(event_type, listener);
			});
		});
	}

	private process_event(event: Event, controller: BaseSceneEventsControllerType) {
		if (!this.canvas) {
			return;
		}
		const event_context: EventContext<Event> = {
			event: event,
			canvas: this.canvas,
			camera_node: this.camera_node,
		};
		controller.process_event(event_context);
	}
}

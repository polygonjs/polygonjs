import {BaseViewerType} from '../_Base';
import {EventContext, BaseSceneEventsControllerType} from '../../scene/utils/events/_BaseEventsController';
type EventListener = (e: Event) => void;
type ListenerByEventType = Map<string, EventListener>;

export class ViewerEventsController {
	protected _bound_listener_map_by_event_controller_type: Map<string, ListenerByEventType> = new Map();

	constructor(protected viewer: BaseViewerType) {}

	updateEvents(events_controller: BaseSceneEventsControllerType) {
		const canvas = this.canvas();
		if (!canvas) {
			return;
		}
		const controller_type = events_controller.type();
		let map = this._bound_listener_map_by_event_controller_type.get(controller_type);
		if (!map) {
			map = new Map();
			this._bound_listener_map_by_event_controller_type.set(controller_type, map);
		}
		map.forEach((listener, event_type) => {
			const eventOwner = this._eventOwner(event_type, canvas);
			eventOwner.removeEventListener(event_type, listener);
		});
		map.clear();

		const listener = (event: Event) => {
			this.processEvent(event, events_controller);
		};
		for (let event_type of events_controller.activeEventTypes()) {
			const eventOwner = this._eventOwner(event_type, canvas);
			eventOwner.addEventListener(event_type, listener);
			map.set(event_type, listener);
		}
	}
	private _eventOwner(event_type: string, canvas: HTMLCanvasElement) {
		if (event_type == 'resize') {
			return window;
		} else {
			return canvas;
		}
	}

	cameraNode() {
		return this.viewer.camerasController.cameraNode();
	}
	canvas() {
		return this.viewer.canvas();
	}

	init() {
		if (!this.canvas) {
			return;
		}
		this.viewer.scene().eventsDispatcher.traverseControllers((controller) => {
			this.updateEvents(controller);
		});
	}

	registeredEventTypes(): string[] {
		const list: string[] = [];
		this._bound_listener_map_by_event_controller_type.forEach((map) => {
			map.forEach((listener, event_type) => {
				list.push(event_type);
			});
		});
		return list;
	}

	dispose() {
		const canvas = this.canvas();
		this._bound_listener_map_by_event_controller_type.forEach((map) => {
			if (canvas) {
				map.forEach((listener, event_type) => {
					canvas.removeEventListener(event_type, listener);
				});
			}
		});
	}

	private processEvent(event: Event, controller: BaseSceneEventsControllerType) {
		const canvas = this.canvas();
		if (!canvas) {
			return;
		}
		const event_context: EventContext<Event> = {
			viewer: this.viewer,
			event: event,
			cameraNode: this.cameraNode(),
		};
		controller.processEvent(event_context);
	}
}

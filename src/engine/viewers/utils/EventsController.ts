import {BaseViewerType} from '../_Base';
import {EventContext, BaseSceneEventsControllerType} from '../../scene/utils/events/_BaseEventsController';
import {EventData} from '../../nodes/event/_BaseInput';
type EventListener = (e: Event) => void;
interface EventListenerWithData {
	listener: EventListener;
	data: EventData;
}
type ListenerByEventType = Map<string, EventListenerWithData>;

export enum CoreEventEmitter {
	CANVAS = 'canvas',
	DOCUMENT = 'document',
}
export const EVENT_EMITTERS: CoreEventEmitter[] = [CoreEventEmitter.CANVAS, CoreEventEmitter.DOCUMENT];
export class ViewerEventsController {
	protected _bound_listener_map_by_event_controller_type: Map<string, ListenerByEventType> = new Map();

	constructor(protected viewer: BaseViewerType) {}

	updateEvents(eventsController: BaseSceneEventsControllerType) {
		const canvas = this.canvas();
		if (!canvas) {
			console.warn('no canvas found');
			return;
		}
		const controllerType = eventsController.type();
		let map = this._bound_listener_map_by_event_controller_type.get(controllerType);
		if (!map) {
			map = new Map();
			this._bound_listener_map_by_event_controller_type.set(controllerType, map);
		}
		map.forEach((listenerWithData, eventType) => {
			const eventOwner = this._eventOwner(listenerWithData.data, canvas);
			eventOwner.removeEventListener(eventType, listenerWithData.listener);
		});
		map.clear();

		const listener = (event: Event) => {
			this.processEvent(event, eventsController);
		};
		for (let eventData of eventsController.activeEventDatas()) {
			const eventOwner = this._eventOwner(eventData, canvas);
			eventOwner.addEventListener(eventData.type, listener);
			map.set(eventData.type, {listener, data: eventData});
		}
	}
	private _eventOwner(eventData: EventData, canvas: HTMLCanvasElement) {
		if (eventData.type == 'resize') {
			return window;
		} else {
			return eventData.emitter == CoreEventEmitter.CANVAS ? canvas : document;
		}
	}

	cameraNode() {
		return this.viewer.camerasController.cameraNode();
	}
	canvas() {
		return this.viewer.canvas();
	}

	init() {
		if (!this.canvas()) {
			console.warn('no canvas found for eventsController');
			return;
		}
		this.viewer.scene().eventsDispatcher.traverseControllers((controller) => {
			this.updateEvents(controller);
		});
	}

	registeredEventTypes(): string[] {
		const list: string[] = [];
		this._bound_listener_map_by_event_controller_type.forEach((map) => {
			map.forEach((listener, eventType) => {
				list.push(eventType);
			});
		});
		return list;
	}

	dispose() {
		const canvas = this.canvas();
		this._bound_listener_map_by_event_controller_type.forEach((map) => {
			if (canvas) {
				map.forEach((listenerWithData, eventType) => {
					const eventOwner = this._eventOwner(listenerWithData.data, canvas);
					eventOwner.removeEventListener(eventType, listenerWithData.listener);
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

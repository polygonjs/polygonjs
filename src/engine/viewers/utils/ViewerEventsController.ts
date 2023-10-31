import {BaseViewerType} from '../_Base';
import {EventContext, BaseSceneEventsControllerType} from '../../scene/utils/events/_BaseEventsController';
import {EVENT_EMITTERS} from '../../../core/event/CoreEventEmitter';
import {ACCEPTED_KEYBOARD_EVENT_TYPES, KeyboardEventType} from '../../../core/event/KeyboardEventType';
import {allowCanvasKeyEventsListener} from '../../../core/event/CanvasKeyFocus';
import {getEventEmitter} from '../../../core/event/EventEmitter';
import {EventData, EventType} from '../../../core/event/EventData';
type ViewerEventListener = (e: Event) => void;
interface EventListenerWithData {
	listener: ViewerEventListener;
	data: EventData;
}
type ListenerByEventType = Map<EventType, EventListenerWithData>;
const DEBUG = false;

export class ViewerEventsController {
	protected _boundListenerMapByEventControllerType: Map<string, ListenerByEventType> = new Map();

	constructor(protected viewer: BaseViewerType) {}

	updateEvents(eventsController: BaseSceneEventsControllerType) {
		if (DEBUG) {
			console.log('------------ updateEvents START:', eventsController);
		}
		const canvas = this.canvas();
		if (!canvas) {
			console.warn('no canvas found');
			return;
		}
		const controllerType = eventsController.type();
		let map = this._boundListenerMapByEventControllerType.get(controllerType);
		if (!map) {
			map = new Map();
			this._boundListenerMapByEventControllerType.set(controllerType, map);
		}
		map.forEach((listenerWithData, eventType) => {
			for (let emitter of EVENT_EMITTERS) {
				const eventEmitter = getEventEmitter({emitter, type: eventType}, canvas);
				eventEmitter.removeEventListener(eventType, listenerWithData.listener);
			}
		});
		map.clear();

		// const listener = (event: Event) => {
		// 	this.processEvent(event, eventsController, canvas);
		// };
		for (let eventData of eventsController.activeEventDatas()) {
			const eventEmitter = getEventEmitter(eventData, canvas);
			const eventType = eventData.type;

			const _processEvent = (
				event: Event,
				controller: BaseSceneEventsControllerType
				// canvas: HTMLCanvasElement
			) => {
				const eventContext: EventContext<Event> = {
					viewer: this.viewer,
					event: event,
					emitter: eventData.emitter,
					// camera: this.camera(),
				};
				controller.processEvent(eventContext);
			};
			const listener = (event: Event) => {
				_processEvent(event, eventsController /*, canvas*/);
			};
			if (DEBUG) {
				console.log('- add event:', eventType, eventEmitter);
			}
			eventEmitter.addEventListener(eventType, listener);

			// if the event being added is a keyboard type,
			// we need to add tabindex to the canvas to allow it to have focus
			if (eventEmitter != document) {
				if (ACCEPTED_KEYBOARD_EVENT_TYPES.includes(eventData.type as KeyboardEventType)) {
					allowCanvasKeyEventsListener(eventEmitter as HTMLCanvasElement);
				}
			}

			map.set(eventData.type, {listener, data: eventData});
		}
		if (DEBUG) {
			console.log('------------ updateEvents DONE:');
		}
	}

	camera() {
		return this.viewer.camera();
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
		this._boundListenerMapByEventControllerType.forEach((map) => {
			map.forEach((listener, eventType) => {
				list.push(eventType);
			});
		});
		return list;
	}

	dispose() {
		const canvas = this.canvas();
		this._boundListenerMapByEventControllerType.forEach((map) => {
			if (canvas) {
				map.forEach((listenerWithData, eventType) => {
					const eventOwner = getEventEmitter(listenerWithData.data, canvas);
					eventOwner.removeEventListener(eventType, listenerWithData.listener);
				});
			}
		});
	}
}

import {BaseViewerType} from '../_Base';
import {EventContext, BaseSceneEventsControllerType} from '../../scene/utils/events/_BaseEventsController';
import {EmitterElementOrWindow} from '../../../core/event/CoreEventEmitter';
import {ACCEPTED_KEYBOARD_EVENT_TYPES, KeyboardEventType} from '../../../core/event/KeyboardEventType';
import {allowCanvasKeyEventsListener} from '../../../core/event/CanvasKeyFocus';
import {getEventEmitter} from '../../../core/event/EventEmitter';
import {EventData, EventType} from '../../../core/event/EventData';
import {setToArray} from '../../../core/SetUtils';
type ViewerEventListener = (e: Event) => void;
interface EventListenerWithData {
	listener: ViewerEventListener;
	data: EventData;
}
type ListenerByEventType = Map<EventType, EventListenerWithData>;
const DEBUG = false;
const _eventTypesSet: Set<string> = new Set();
// let listenerId: number = 0;

export class ViewerEventsController {
	protected _eventTypes: Map<string, Map<EmitterElementOrWindow, ListenerByEventType>> = new Map();

	constructor(protected viewer: BaseViewerType) {}

	removeEvents(eventsController: BaseSceneEventsControllerType, _canvas?: HTMLCanvasElement) {
		const canvas = _canvas || this.canvas();
		if (!canvas) {
			console.warn('no canvas found');
			return;
		}

		const mapForController = this._eventTypes.get(eventsController.type());
		if (!mapForController) {
			return;
		}
		mapForController.forEach((listenerByEventType, emitter) => {
			listenerByEventType.forEach((listenerWithData, eventType: EventType) => {
				const eventEmitter = getEventEmitter({emitter: listenerWithData.data.emitter, type: eventType}, canvas);
				eventEmitter.removeEventListener(eventType, listenerWithData.listener);
			});
			listenerByEventType.clear();
		});
	}

	updateEvents(eventsController: BaseSceneEventsControllerType) {
		if (DEBUG) {
			console.warn('------------ updateEvents START:', eventsController);
		}
		const canvas = this.canvas();
		if (!canvas) {
			console.warn('no canvas found');
			return;
		}

		this.removeEvents(eventsController, canvas);

		// const listener = (event: Event) => {
		// 	this.processEvent(event, eventsController, canvas);
		// };
		const activeEventDatas = eventsController.activeEventDatas();
		for (const eventData of activeEventDatas) {
			const eventEmitter = getEventEmitter(eventData, canvas);
			const map = this._mapForEmitter(eventsController, eventEmitter);
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
			// listenerId++;
			// const _id = listenerId;
			const listener = (event: Event) => {
				// console.log('run listener:', _id, eventType);
				_processEvent(event, eventsController /*, canvas*/);
			};
			if (DEBUG) {
				console.log('+ add event:', eventType, eventEmitter);
			}
			eventEmitter.addEventListener(eventType, listener, {passive: true});

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
	private _mapForEmitter(eventsController: BaseSceneEventsControllerType, emitter: EmitterElementOrWindow) {
		const controllerType = eventsController.type();
		let mapForController = this._eventTypes.get(controllerType);
		if (!mapForController) {
			mapForController = new Map();
			this._eventTypes.set(controllerType, mapForController);
		}
		let mapForEmitter = mapForController.get(emitter);
		if (!mapForEmitter) {
			mapForEmitter = new Map();
			mapForController.set(emitter, mapForEmitter);
		}
		return mapForEmitter;
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

	unmount() {
		this.viewer.scene().eventsDispatcher.traverseControllers((controller) => {
			this.removeEvents(controller);
		});
	}

	registeredEventTypes(): string[] {
		_eventTypesSet.clear();
		this._eventTypes.forEach((mapForEmitter) => {
			mapForEmitter.forEach((listenerByEventType, emitter) => {
				listenerByEventType.forEach((listener, eventType: string) => {
					_eventTypesSet.add(eventType);
				});
			});
		});
		const target: string[] = [];
		setToArray(_eventTypesSet, target);
		return target;
	}
}

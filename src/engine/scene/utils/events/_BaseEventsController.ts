import {BaseInputEventNodeType} from '../../../nodes/event/_BaseInput';
import {SceneEventsDispatcher} from './EventsDispatcher';
import {BaseNodeType} from '../../../nodes/_Base';
import {Intersection} from 'three';
import {BaseViewerType} from '../../../viewers/_Base';
// import type {BaseUserInputJsNodeType} from '../../../nodes/js/_BaseUserInput';
import {EventData} from '../../../../core/event/EventData';
// import {MapUtils} from '../../../../core/MapUtils';
import {CoreEventEmitter} from '../../../../core/event/CoreEventEmitter';
import {ActorEvaluator} from '../../../nodes/js/code/assemblers/actor/Evaluator';
import {MapUtils} from '../../../../core/MapUtils';

interface EventContextValue {
	node?: BaseNodeType; // for node_cook
	intersect?: Intersection; // for raycast
}

export interface EventContext<E extends Event> {
	viewer?: Readonly<BaseViewerType>;
	event?: Readonly<E>;
	emitter?: CoreEventEmitter;
	// camera?: Readonly<Camera>;
	value?: EventContextValue;
}
export abstract class BaseSceneEventsController<
	E extends Event,
	T extends BaseInputEventNodeType
	// JsNodeType extends BaseUserInputJsNodeType
> {
	private _activeEventDatas: EventData[] = [];
	private _activeEventDataTypes: Set<string> = new Set();
	protected _eventNodes: Set<T> = new Set();
	protected _requireCanvasEventListeners: boolean = false;
	protected _actorEvaluators: Set<ActorEvaluator> = new Set();
	// protected _actorEventNames: Set<string> = new Set();
	protected _actorEvaluatorsByEventNames: Map<string, Map<CoreEventEmitter, Set<ActorEvaluator>>> = new Map();
	constructor(protected dispatcher: SceneEventsDispatcher) {}

	registerEventNode(node: T) {
		this._eventNodes.add(node);
		this.updateViewerEventListeners();
	}
	unregisterEventNode(node: T) {
		this._eventNodes.delete(node);
		this.updateViewerEventListeners();
	}
	registerEvaluator(evaluator: ActorEvaluator) {
		this._actorEvaluators.add(evaluator);
		this._updateActorEvaluatorCache();
		this.updateViewerEventListeners();
	}
	unregisterEvaluator(evaluator: ActorEvaluator) {
		this._actorEvaluators.delete(evaluator);
		this._updateActorEvaluatorCache();
		this.updateViewerEventListeners();
	}

	private _updateActorEvaluatorCache() {
		// this._actorEventNames.clear();
		this._actorEvaluatorsByEventNames.clear();
		this._actorEvaluators.forEach((evaluator) => {
			const eventDatas = evaluator.eventDatas;
			if (eventDatas) {
				eventDatas.forEach((eventData) => {
					const eventName = eventData.type;
					const emitter = eventData.emitter;
					let mapForEventName = this._actorEvaluatorsByEventNames.get(eventName);
					if (!mapForEventName) {
						mapForEventName = new Map();
						this._actorEvaluatorsByEventNames.set(eventName, mapForEventName);
					}
					MapUtils.addToSetAtEntry(mapForEventName, emitter, evaluator);
				});
			}
			// const nodeEventNames = node.userInputEventNames();
			// const emitter = node.eventEmitter();
			// for (let eventName of nodeEventNames) {
			// 	// this._actorEventNames.add(eventName);

			// 	let mapForEventName = this._actorNodesByEventNames.get(eventName);
			// 	if (!mapForEventName) {
			// 		mapForEventName = new Map();
			// 		this._actorNodesByEventNames.set(eventName, mapForEventName);
			// 	}
			// 	MapUtils.addToSetAtEntry(mapForEventName, emitter, node);
			// }
		});
	}

	abstract type(): string;
	abstract acceptedEventTypes(): Set<string>;
	// abstract accepts_event(event: Event): boolean;

	processEvent(eventContext: EventContext<E>) {
		if (this._activeEventDatas.length == 0) {
			return;
		}
		const eventType = eventContext.event?.type;
		if (eventType) {
			// The check here if the eventType is active
			// is not necessary for canvas events (pointer, mouse, keyboard)
			// but currently necessary for scene events (such as tick)
			if (!this._activeEventDataTypes.has(eventType)) {
				return;
			}
		}

		this._eventNodes.forEach((node) => {
			node.processEvent(eventContext);
		});
	}

	updateViewerEventListeners() {
		this._updateActiveEventTypes();

		if (this._requireCanvasEventListeners) {
			this.dispatcher.scene.viewersRegister.traverseViewers((viewer) => {
				viewer.eventsController().updateEvents(this);
			});
		}
	}

	activeEventDatas() {
		return this._activeEventDatas;
	}

	private _updateActiveEventTypes() {
		const _storeEventData = (eventData: EventData) => {
			this._activeEventDatas.push(eventData);
			this._activeEventDataTypes.add(eventData.type);
		};

		const _reset = () => {
			this._activeEventDatas.splice(0, this._activeEventDatas.length);
			this._activeEventDataTypes.clear();
		};

		const _actorEventDatas = () => {
			let eventTypeByEmitter: Map<CoreEventEmitter, Set<string>> = new Map();

			this._actorEvaluatorsByEventNames.forEach((mapForEventName, eventName) => {
				mapForEventName.forEach((nodes, emitter) => {
					nodes.forEach((node) => {
						MapUtils.addToSetAtEntry(eventTypeByEmitter, emitter, eventName);
					});
				});
			});
			const eventDatas: EventData[] = [];
			eventTypeByEmitter.forEach((eventNames, emitter) => {
				for (let eventName of eventNames) {
					const eventData: EventData = {
						type: eventName,
						emitter,
					};
					eventDatas.push(eventData);
				}
			});
			return eventDatas;
		};

		const _updateActorNodesEventData = () => {
			const actorEventDatas = _actorEventDatas();
			if (actorEventDatas) {
				for (let data of actorEventDatas) {
					_storeEventData(data);
				}
			}
		};

		const _updateEventNodesEventData = () => {
			const activeNodeEventTypesState: Set<EventData> = new Set();
			this._eventNodes.forEach((node) => {
				if (node.parent()) {
					const nodeActiveEventDatas = node.activeEventDatas();
					for (let data of nodeActiveEventDatas) {
						activeNodeEventTypesState.add(data);
					}
				}
			});
			activeNodeEventTypesState.forEach((state, data) => {
				_storeEventData(data);
			});
		};

		_reset();
		_updateActorNodesEventData();
		_updateEventNodesEventData();
	}
}

export type BaseSceneEventsControllerType = BaseSceneEventsController<
	Event,
	BaseInputEventNodeType
	// BaseUserInputJsNodeType
>;
export class BaseSceneEventsControllerClass extends BaseSceneEventsController<
	Event,
	BaseInputEventNodeType
	// BaseUserInputJsNodeType
> {
	type() {
		return '';
	}
	acceptedEventTypes(): Set<string> {
		return new Set<string>();
	}
}

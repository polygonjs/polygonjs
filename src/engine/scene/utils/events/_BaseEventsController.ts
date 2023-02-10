import {BaseInputEventNodeType} from '../../../nodes/event/_BaseInput';
import {SceneEventsDispatcher} from './EventsDispatcher';
import {BaseNodeType} from '../../../nodes/_Base';
import {Intersection} from 'three';
import {BaseViewerType} from '../../../viewers/_Base';
import type {BaseUserInputActorNodeType} from '../../../nodes/actor/_BaseUserInput';
import {EventData} from '../../../../core/event/EventData';
import {MapUtils} from '../../../../core/MapUtils';
import {CoreEventEmitter} from '../../../../core/event/CoreEventEmitter';

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
	T extends BaseInputEventNodeType,
	ActorType extends BaseUserInputActorNodeType
> {
	private _activeEventDatas: EventData[] = [];
	private _activeEventDataTypes: Set<string> = new Set();
	protected _eventNodes: Set<T> = new Set();
	protected _requireCanvasEventListeners: boolean = false;
	protected _actorEventNodes: Set<ActorType> = new Set();
	// protected _actorEventNames: Set<string> = new Set();
	protected _actorNodesByEventNames: Map<string, Map<CoreEventEmitter, Set<ActorType>>> = new Map();
	constructor(protected dispatcher: SceneEventsDispatcher) {}

	registerEventNode(node: T) {
		this._eventNodes.add(node);
		this.updateViewerEventListeners();
	}
	unregisterEventNode(node: T) {
		this._eventNodes.delete(node);
		this.updateViewerEventListeners();
	}
	registerActorNode(node: ActorType) {
		this._actorEventNodes.add(node);
		this._updateActorCache();
		this.updateViewerEventListeners();
	}
	unregisterActorNode(node: ActorType) {
		this._actorEventNodes.delete(node);
		this._updateActorCache();
		this.updateViewerEventListeners();
	}

	private _updateActorCache() {
		// this._actorEventNames.clear();
		this._actorNodesByEventNames.clear();
		this._actorEventNodes.forEach((node) => {
			const nodeEventNames = node.userInputEventNames();
			const emitter = node.eventEmitter();
			for (let eventName of nodeEventNames) {
				// this._actorEventNames.add(eventName);

				let mapForEventName = this._actorNodesByEventNames.get(eventName);
				if (!mapForEventName) {
					mapForEventName = new Map();
					this._actorNodesByEventNames.set(eventName, mapForEventName);
				}
				MapUtils.addToSetAtEntry(mapForEventName, emitter, node);
			}
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

			this._actorNodesByEventNames.forEach((mapForEventName, eventName) => {
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
	BaseInputEventNodeType,
	BaseUserInputActorNodeType
>;
export class BaseSceneEventsControllerClass extends BaseSceneEventsController<
	Event,
	BaseInputEventNodeType,
	BaseUserInputActorNodeType
> {
	type() {
		return '';
	}
	acceptedEventTypes(): Set<string> {
		return new Set<string>();
	}
}

import {BaseCameraObjNodeType} from '../../../nodes/obj/_BaseCamera';
import {BaseInputEventNodeType, EventData} from '../../../nodes/event/_BaseInput';
import {SceneEventsDispatcher} from './EventsDispatcher';
import {BaseNodeType} from '../../../nodes/_Base';
import {Intersection} from 'three';
import {BaseViewerType} from '../../../viewers/_Base';
import {BaseUserInputActorNodeType} from '../../../nodes/actor/_BaseUserInput';

interface EventContextValue {
	node?: BaseNodeType; // for node_cook
	intersect?: Intersection; // for raycast
}

export interface EventContext<E extends Event> {
	viewer?: Readonly<BaseViewerType>;
	event?: Readonly<E>;
	cameraNode?: Readonly<BaseCameraObjNodeType>;
	value?: EventContextValue;
}
export abstract class BaseSceneEventsController<E extends Event, T extends BaseInputEventNodeType> {
	protected _eventNodes: Set<T> = new Set();
	protected _requireCanvasEventListeners: boolean = false;
	protected _actorEventNamesByNode: Map<BaseUserInputActorNodeType, string[]> = new Map();
	protected _actorEventNames: Set<string> = new Set();
	protected _actorNodesByEventNames: Map<string, Set<BaseUserInputActorNodeType>> = new Map();
	constructor(protected dispatcher: SceneEventsDispatcher) {}

	registerEventNode(node: T) {
		this._eventNodes.add(node);
		this.updateViewerEventListeners();
	}
	unregisterEventNode(node: T) {
		this._eventNodes.delete(node);
		this.updateViewerEventListeners();
	}
	registerActorNode(node: BaseUserInputActorNodeType) {
		const eventNames = node.userInputEventNames();
		this._actorEventNamesByNode.set(node, eventNames);
		this._updateActorCache();
		this.updateViewerEventListeners();
	}
	unregisterActorNode(node: BaseUserInputActorNodeType) {
		this._actorEventNamesByNode.delete(node);
		this._updateActorCache();
		this.updateViewerEventListeners();
	}

	private _updateActorCache() {
		this._actorEventNames.clear();
		this._actorNodesByEventNames.clear();
		this._actorEventNamesByNode.forEach((nodeEventNames, node) => {
			for (let eventName of nodeEventNames) {
				this._actorEventNames.add(eventName);

				let setForEventName = this._actorNodesByEventNames.get(eventName);
				if (!setForEventName) {
					setForEventName = new Set();
					this._actorNodesByEventNames.set(eventName, setForEventName);
				}
				setForEventName.add(node);
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

	private _activeEventDatas: EventData[] = [];
	private _activeEventDataTypes: Set<string> = new Set();
	activeEventDatas() {
		return this._activeEventDatas;
	}
	private _resetActiveEventData() {
		this._activeEventDatas.splice(0, this._activeEventDatas.length);
		this._activeEventDataTypes.clear();
		const actorEventDatas = this._actorEventDatas();
		if (actorEventDatas) {
			for (let data of actorEventDatas) {
				this._storeEventData(data);
			}
		}
	}
	protected _actorEventDatas(): EventData[] | undefined {
		return undefined;
	}
	private _storeEventData(eventData: EventData) {
		this._activeEventDatas.push(eventData);
		this._activeEventDataTypes.add(eventData.type);
	}
	private _updateActiveEventTypes() {
		this._resetActiveEventData();
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
			this._storeEventData(data);
		});
	}
}

export type BaseSceneEventsControllerType = BaseSceneEventsController<Event, BaseInputEventNodeType>;
export class BaseSceneEventsControllerClass extends BaseSceneEventsController<Event, BaseInputEventNodeType> {
	type() {
		return '';
	}
	acceptedEventTypes(): Set<string> {
		return new Set<string>();
	}
}

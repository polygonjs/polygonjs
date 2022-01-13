import {BaseCameraObjNodeType} from '../../../nodes/obj/_BaseCamera';
import {BaseInputEventNodeType, EventData} from '../../../nodes/event/_BaseInput';
import {SceneEventsDispatcher} from './EventsDispatcher';
import {BaseNodeType} from '../../../nodes/_Base';
import {Intersection} from 'three/src/core/Raycaster';
import {CoreGraphNodeId} from '../../../../core/graph/CoreGraph';
import {BaseViewerType} from '../../../viewers/_Base';

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
	protected _nodesByGraphNodeId: Map<CoreGraphNodeId, T> = new Map();
	protected _requireCanvasEventListeners: boolean = false;
	constructor(private dispatcher: SceneEventsDispatcher) {}

	registerNode(node: T) {
		this._nodesByGraphNodeId.set(node.graphNodeId(), node);
		this.updateViewerEventListeners();
	}
	unregisterNode(node: T) {
		this._nodesByGraphNodeId.delete(node.graphNodeId());
		this.updateViewerEventListeners();
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

		this._nodesByGraphNodeId.forEach((node) => {
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
	private _updateActiveEventTypes() {
		const activeNodeEventTypesState: Map<EventData, boolean> = new Map();
		this._activeEventDataTypes.clear();

		this._nodesByGraphNodeId.forEach((node) => {
			if (node.parent()) {
				const nodeActiveEventDatas = node.activeEventDatas();
				for (let data of nodeActiveEventDatas) {
					activeNodeEventTypesState.set(data, true);
				}
			}
		});
		this._activeEventDatas = [];
		activeNodeEventTypesState.forEach((state, data) => {
			this._activeEventDatas.push(data);
			this._activeEventDataTypes.add(data.type);
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

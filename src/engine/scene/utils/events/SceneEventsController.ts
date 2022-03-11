import {MapUtils} from '../../../../core/MapUtils';
import {BaseEventNodeType} from '../../../nodes/event/_Base';
import {EventContext} from './_BaseEventsController';

export enum PolySceneEventType {
	LOADED = 'sceneLoaded',
	PLAY = 'play',
	PAUSE = 'pause',
	// TICK = 'tick',
}
export const ACCEPTED_SCENE_EVENT_TYPES: PolySceneEventType[] = [
	PolySceneEventType.LOADED,
	PolySceneEventType.PLAY,
	PolySceneEventType.PAUSE,
	// SceneEventType.TICK,
];

export class PolySceneEvent extends Event {
	constructor(type: PolySceneEventType) {
		super(type);
	}
	override get type(): PolySceneEventType {
		return super.type as PolySceneEventType;
	}
}
export const SCENE_EVENT_LOADED_EVENT_CONTEXT: EventContext<PolySceneEvent> = {
	event: new PolySceneEvent(PolySceneEventType.LOADED),
};
export const SCENE_EVENT_PLAY_EVENT_CONTEXT: EventContext<PolySceneEvent> = {
	event: new PolySceneEvent(PolySceneEventType.PLAY),
};
export const SCENE_EVENT_PAUSE_EVENT_CONTEXT: EventContext<PolySceneEvent> = {
	event: new PolySceneEvent(PolySceneEventType.PAUSE),
};
// export const SCENE_EVENT_TICK_EVENT_CONTEXT: EventContext<SceneEvent> = {event: new SceneEvent(SceneEventType.TICK)};

export class SceneEventsController {
	dispatch<T extends PolySceneEventType>(eventContext: EventContext<PolySceneEvent>) {
		const event = eventContext.event;
		if (!event) {
			return;
		}
		const set = this._observersByEventType.get(event.type);
		if (!set) {
			return;
		}
		set.forEach((node) => {
			node.processEvent(eventContext);
		});
	}

	private _observersByEventType: Map<PolySceneEventType, Set<BaseEventNodeType>> = new Map();
	removeObserverFromAllEventTypes(eventNode: BaseEventNodeType) {
		this._observersByEventType.forEach((nodes, eventType) => {
			nodes.delete(eventNode);
		});
	}
	addObserver(eventNode: BaseEventNodeType, eventType: PolySceneEventType) {
		MapUtils.addToSetAtEntry(this._observersByEventType, eventType, eventNode);
	}
}

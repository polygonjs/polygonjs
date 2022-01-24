import {MapUtils} from '../../../../core/MapUtils';
import {BaseEventNodeType} from '../../../nodes/event/_Base';
import {EventContext} from './_BaseEventsController';

export enum SceneEventType {
	LOADED = 'sceneLoaded',
	PLAY = 'play',
	PAUSE = 'pause',
	// TICK = 'tick',
}
export const ACCEPTED_SCENE_EVENT_TYPES: SceneEventType[] = [
	SceneEventType.LOADED,
	SceneEventType.PLAY,
	SceneEventType.PAUSE,
	// SceneEventType.TICK,
];

export class SceneEvent extends Event {
	constructor(type: SceneEventType) {
		super(type);
	}
	override get type(): SceneEventType {
		return super.type as SceneEventType;
	}
}
export const SCENE_EVENT_LOADED_EVENT_CONTEXT: EventContext<SceneEvent> = {
	event: new SceneEvent(SceneEventType.LOADED),
};
export const SCENE_EVENT_PLAY_EVENT_CONTEXT: EventContext<SceneEvent> = {event: new SceneEvent(SceneEventType.PLAY)};
export const SCENE_EVENT_PAUSE_EVENT_CONTEXT: EventContext<SceneEvent> = {event: new SceneEvent(SceneEventType.PAUSE)};
// export const SCENE_EVENT_TICK_EVENT_CONTEXT: EventContext<SceneEvent> = {event: new SceneEvent(SceneEventType.TICK)};

export class SceneEventsController {
	dispatch<T extends SceneEventType>(eventContext: EventContext<SceneEvent>) {
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

	private _observersByEventType: Map<SceneEventType, Set<BaseEventNodeType>> = new Map();
	removeObserverFromAllEventTypes(eventNode: BaseEventNodeType) {
		this._observersByEventType.forEach((nodes, eventType) => {
			nodes.delete(eventNode);
		});
	}
	addObserver(eventNode: BaseEventNodeType, eventType: SceneEventType) {
		MapUtils.addToSetAtEntry(this._observersByEventType, eventType, eventNode);
	}
}

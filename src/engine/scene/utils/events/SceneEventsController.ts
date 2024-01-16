import {addToSetAtEntry} from '../../../../core/MapUtils';
import {BaseEventNodeType} from '../../../nodes/event/_Base';
import {PolyEventName} from '../../../poly/utils/PolyEventName';
import {EventContext} from './_BaseEventsController';

// export enum PolySceneEventType {
// 	LOADED = 'sceneLoaded',
// 	PLAY = 'play',
// 	PAUSE = 'pause',
// 	// TICK = 'tick',
// }

export class PolySceneEvent extends Event {
	constructor(type: PolyEventName) {
		super(type);
	}
	override get type(): PolyEventName {
		return super.type as PolyEventName;
	}
}
export const SCENE_EVENT_CREATED_EVENT_CONTEXT: EventContext<PolySceneEvent> = {
	event: new PolySceneEvent(PolyEventName.SCENE_CREATED),
};
export const SCENE_EVENT_READY_EVENT_CONTEXT: EventContext<PolySceneEvent> = {
	event: new PolySceneEvent(PolyEventName.SCENE_READY),
};
export const SCENE_EVENT_PLAY_EVENT_CONTEXT: EventContext<PolySceneEvent> = {
	event: new PolySceneEvent(PolyEventName.SCENE_PLAY),
};
export const SCENE_EVENT_PAUSE_EVENT_CONTEXT: EventContext<PolySceneEvent> = {
	event: new PolySceneEvent(PolyEventName.SCENE_PAUSE),
};
// export const SCENE_EVENT_TICK_EVENT_CONTEXT: EventContext<SceneEvent> = {event: new SceneEvent(SceneEventType.TICK)};

export class SceneEventsController {
	dispatch<T extends PolyEventName>(eventContext: EventContext<PolySceneEvent>) {
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

	private _observersByEventType: Map<PolyEventName, Set<BaseEventNodeType>> = new Map();
	removeObserverFromAllEventTypes(eventNode: BaseEventNodeType) {
		this._observersByEventType.forEach((nodes, eventType) => {
			nodes.delete(eventNode);
		});
	}
	addObserver(eventNode: BaseEventNodeType, eventType: PolyEventName) {
		addToSetAtEntry(this._observersByEventType, eventType, eventNode);
	}
}

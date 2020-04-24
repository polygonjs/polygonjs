import {BaseEventsController} from './_BaseEventsController';
import {SceneEventNode} from '../../../nodes/event/SceneEvent';

export enum SceneEventType {
	LOADED = 'scene_loaded',
	PLAY = 'play',
	PAUSE = 'pause',
	TIME_CHANGE = 'time_change',
}
export const ACCEPTED_SCENE_EVENT_TYPES: SceneEventType[] = [
	SceneEventType.LOADED,
	SceneEventType.PLAY,
	SceneEventType.PAUSE,
	SceneEventType.TIME_CHANGE,
];

export class SceneEventsController extends BaseEventsController<Event, SceneEventNode> {
	accepts_event(event: Event) {
		return ACCEPTED_SCENE_EVENT_TYPES.includes(event.type as SceneEventType);
	}
}

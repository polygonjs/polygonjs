import {BaseSceneEventsController} from './_BaseEventsController';
import {SceneEventNode} from '../../../nodes/event/Scene';

export enum SceneEventType {
	LOADED = 'scene_loaded',
	PLAY = 'play',
	PAUSE = 'pause',
	TICK = 'tick',
}
export const ACCEPTED_SCENE_EVENT_TYPES: SceneEventType[] = [
	SceneEventType.LOADED,
	SceneEventType.PLAY,
	SceneEventType.PAUSE,
	SceneEventType.TICK,
];

export class SceneEventsController extends BaseSceneEventsController<Event, SceneEventNode> {
	type() {
		return 'scene';
	}
	accepted_event_types() {
		return ACCEPTED_SCENE_EVENT_TYPES.map((n) => `${n}`);
	}
}

import { BaseSceneEventsController } from './_BaseEventsController';
import { SceneEventNode } from '../../../nodes/event/Scene';
export declare enum SceneEventType {
    LOADED = "scene_loaded",
    PLAY = "play",
    PAUSE = "pause",
    TICK = "tick"
}
export declare const ACCEPTED_SCENE_EVENT_TYPES: SceneEventType[];
export declare class SceneEventsController extends BaseSceneEventsController<Event, SceneEventNode> {
    type(): string;
    accepted_event_types(): string[];
}

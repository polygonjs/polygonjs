import {BaseSceneEventsController} from "./_BaseEventsController";
export var SceneEventType;
(function(SceneEventType2) {
  SceneEventType2["LOADED"] = "scene_loaded";
  SceneEventType2["PLAY"] = "play";
  SceneEventType2["PAUSE"] = "pause";
  SceneEventType2["TICK"] = "tick";
})(SceneEventType || (SceneEventType = {}));
export const ACCEPTED_SCENE_EVENT_TYPES = [
  SceneEventType.LOADED,
  SceneEventType.PLAY,
  SceneEventType.PAUSE,
  SceneEventType.TICK
];
export class SceneEventsController extends BaseSceneEventsController {
  type() {
    return "scene";
  }
  accepted_event_types() {
    return ACCEPTED_SCENE_EVENT_TYPES.map((n) => `${n}`);
  }
}

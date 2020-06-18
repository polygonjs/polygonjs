import { PolyScene } from '../../PolyScene';
import { MouseEventsController } from './MouseEventsController';
import { SceneEventsController } from './SceneEventsController';
import { BaseSceneEventsController } from './_BaseEventsController';
import { KeyboardEventsController } from './KeyboardEventsController';
import { BaseInputEventNodeType } from '../../../nodes/event/_BaseInput';
export declare class SceneEventsDispatcher {
    scene: PolyScene;
    private _keyboard_events_controller;
    private _mouse_events_controller;
    private _scene_events_controller;
    private _controllers;
    constructor(scene: PolyScene);
    register_event_node(node: BaseInputEventNodeType): void;
    unregister_event_node(node: BaseInputEventNodeType): void;
    update_viewer_event_listeners(node: BaseInputEventNodeType): void;
    traverse_controllers(callback: (controller: BaseSceneEventsController<Event, BaseInputEventNodeType>) => void): void;
    private _find_or_create_controller_for_node;
    get keyboard_events_controller(): KeyboardEventsController;
    get mouse_events_controller(): MouseEventsController;
    get scene_events_controller(): SceneEventsController;
    private _create_controller;
}

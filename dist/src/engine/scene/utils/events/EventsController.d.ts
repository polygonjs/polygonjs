import { PolyScene } from '../../PolyScene';
import { BaseEventNodeType } from '../../../nodes/event/_Base';
import { BaseCameraObjNodeType } from '../../../nodes/obj/_BaseCamera';
export declare class SceneEventsController {
    private _mouse_events_controller;
    private _controllers;
    constructor(scene: PolyScene);
    register_event_node(node: BaseEventNodeType): void;
    unregister_event_node(node: BaseEventNodeType): void;
    process_event(event: Event, canvas: HTMLCanvasElement, camera_node: BaseCameraObjNodeType): void;
    private _get_controller_for_node;
}

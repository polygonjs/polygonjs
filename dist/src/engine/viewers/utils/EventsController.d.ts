import { BaseViewerType } from '../_Base';
import { BaseSceneEventsControllerType } from '../../scene/utils/events/_BaseEventsController';
declare type EventListener = (e: Event) => void;
declare type ListenerByEventType = Map<string, EventListener>;
export declare class ViewerEventsController {
    protected viewer: BaseViewerType;
    protected _bound_process_event: (event: Event, controller: BaseSceneEventsControllerType) => void;
    protected _bound_listener_map_by_event_controller_type: Map<string, ListenerByEventType>;
    constructor(viewer: BaseViewerType);
    update_events(events_controller: BaseSceneEventsControllerType): void;
    get camera_node(): import("../../nodes/obj/_BaseCamera").BaseCameraObjNodeType;
    get canvas(): HTMLCanvasElement | undefined;
    init(): void;
    registered_event_types(): string[];
    dispose(): void;
    private process_event;
}
export {};

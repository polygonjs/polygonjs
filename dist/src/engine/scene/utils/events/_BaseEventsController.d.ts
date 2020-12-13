import { BaseCameraObjNodeType } from '../../../nodes/obj/_BaseCamera';
import { BaseInputEventNodeType } from '../../../nodes/event/_BaseInput';
import { SceneEventsDispatcher } from './EventsDispatcher';
import { BaseNodeType } from '../../../nodes/_Base';
import { Intersection } from 'three/src/core/Raycaster';
import { CoreGraphNodeId } from '../../../../core/graph/CoreGraph';
interface EventContextValue {
    node?: BaseNodeType;
    intersect?: Intersection;
}
export interface EventContext<E extends Event> {
    event?: Readonly<E>;
    canvas?: Readonly<HTMLCanvasElement>;
    camera_node?: Readonly<BaseCameraObjNodeType>;
    value?: EventContextValue;
}
export declare abstract class BaseSceneEventsController<E extends Event, T extends BaseInputEventNodeType> {
    private dispatcher;
    protected _nodes_by_graph_node_id: Map<CoreGraphNodeId, T>;
    protected _require_canvas_event_listeners: boolean;
    constructor(dispatcher: SceneEventsDispatcher);
    register_node(node: T): void;
    unregister_node(node: T): void;
    abstract type(): string;
    abstract accepted_event_types(): string[];
    process_event(event_context: EventContext<E>): void;
    update_viewer_event_listeners(): void;
    private _active_event_types;
    active_event_types(): string[];
    private _update_active_event_types;
}
export declare type BaseSceneEventsControllerType = BaseSceneEventsController<Event, BaseInputEventNodeType>;
export declare class BaseSceneEventsControllerClass extends BaseSceneEventsController<Event, BaseInputEventNodeType> {
    type(): string;
    accepted_event_types(): string[];
}
export {};

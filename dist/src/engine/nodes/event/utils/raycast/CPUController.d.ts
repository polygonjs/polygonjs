import { EventContext } from '../../../../scene/utils/events/_BaseEventsController';
import { RaycastEventNode } from '../../Raycast';
export declare enum CPUIntersectWith {
    GEOMETRY = "geometry",
    PLANE = "plane"
}
export declare const CPU_INTERSECT_WITH_OPTIONS: CPUIntersectWith[];
export declare class RaycastCPUController {
    private _node;
    private _mouse;
    private _mouse_array;
    private _raycaster;
    private _resolved_target;
    private _intersection_position;
    constructor(_node: RaycastEventNode);
    update_mouse(context: EventContext<MouseEvent>): void;
    process_event(context: EventContext<MouseEvent>): void;
    private _plane;
    private _plane_intersect_target;
    private _plane_intersect_target_array;
    private _intersect_with_plane;
    private _intersect_with_geometry;
    private _prepare_raycaster;
    update_target(): void;
    static PARAM_CALLBACK_update_target(node: RaycastEventNode): void;
}

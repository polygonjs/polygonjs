import { EventContext } from '../../../../scene/utils/events/_BaseEventsController';
import { RaycastEventNode } from '../../Raycast';
import { Intersection } from 'three/src/core/Raycaster';
import { AttribType } from '../../../../../core/geometry/Constant';
import { RaycastCPUVelocityController } from './VelocityController';
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
    readonly velocity_controller: RaycastCPUVelocityController;
    constructor(_node: RaycastEventNode);
    update_mouse(context: EventContext<MouseEvent>): void;
    process_event(context: EventContext<MouseEvent>): void;
    private _plane;
    private _plane_intersect_target;
    private _intersect_with_plane;
    private _intersect_with_geometry;
    private _resolve_geometry_attribute;
    static resolve_geometry_attribute(intersection: Intersection, attribute_name: string, attrib_type: AttribType): string | number | undefined;
    private static _vA;
    private static _vB;
    private static _vC;
    private static _uvA;
    private static _uvB;
    private static _uvC;
    private static _hitUV;
    static resolve_geometry_attribute_for_mesh(intersection: Intersection, attribute_name: string, attrib_type: AttribType): string | number | undefined;
    static resolve_geometry_attribute_for_point(intersection: Intersection, attribute_name: string, attrib_type: AttribType): string | number | undefined;
    private _found_position_target_param;
    private _hit_position_array;
    private _set_position_param;
    private _prepare_raycaster;
    update_target(): void;
    update_position_target(): Promise<void>;
    static PARAM_CALLBACK_update_target(node: RaycastEventNode): void;
}

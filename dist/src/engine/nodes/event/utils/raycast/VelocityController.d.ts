import { RaycastEventNode } from '../../Raycast';
import { Vector3 } from 'three/src/math/Vector3';
export declare enum CPUIntersectWith {
    GEOMETRY = "geometry",
    PLANE = "plane"
}
export declare const CPU_INTERSECT_WITH_OPTIONS: CPUIntersectWith[];
export declare class RaycastCPUVelocityController {
    private _node;
    constructor(_node: RaycastEventNode);
    private _prev_position;
    private _set_pos_timestamp;
    private _found_velocity_target_param;
    private _hit_velocity;
    private _hit_velocity_array;
    process(hit_position: Vector3): void;
    reset(): void;
}

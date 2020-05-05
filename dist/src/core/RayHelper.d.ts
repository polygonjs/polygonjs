import { Vector3 } from 'three/src/math/Vector3';
import { Scene } from 'three/src/scenes/Scene';
import { Plane } from 'three/src/math/Plane';
import { Object3D } from 'three/src/core/Object3D';
import { Camera } from 'three/src/cameras/Camera';
import { Vector2 } from 'three/src/math/Vector2';
import { EventHelper } from './EventHelper';
export declare class RayHelper {
    private event_helper;
    private default_scene;
    private _point_threshold_mult;
    private raycaster;
    private world_plane;
    private _ignore_list;
    private _mouse;
    constructor(event_helper: EventHelper, default_scene: Scene, _point_threshold_mult?: number);
    point_threshold(): number | undefined;
    point_threshold_mult(): number;
    set_point_threshold(point_threshold: number): void;
    ignore(mesh: Object3D): Object3D;
    mouse(): Vector2;
    intersects_from_event(event: MouseEvent, camera: Camera, objects: Object3D[] | null): import("three/src/core/Raycaster").Intersection[];
    intersect_plane_from_event(event: MouseEvent, camera: Camera, plane: Plane): Vector3;
    intersect_plane(mouse: Vector2, camera: Camera, plane: Plane): Vector3;
    intersect_world_plane(camera: Camera): Vector3;
}

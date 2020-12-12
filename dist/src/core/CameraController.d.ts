import { Object3D } from 'three/src/core/Object3D';
declare type CameraControllerCallback = (target: Object3D) => void;
export declare class CameraController {
    private _callback;
    private _update_always;
    private _listener;
    private _target;
    private _listener_added;
    constructor(_callback: CameraControllerCallback);
    remove_target(): void;
    set_target(target: Object3D | undefined): void;
    set_update_always(new_update_always: boolean): void;
    private _current_event_name;
    private _add_camera_event;
    private _remove_camera_event;
    private _execute_callback;
}
export {};

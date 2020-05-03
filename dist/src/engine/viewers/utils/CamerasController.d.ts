import { Vector2 } from 'three/src/math/Vector2';
import { BaseViewerType } from '../_Base';
export declare class ViewerCamerasController {
    private _viewer;
    private _size;
    private _aspect;
    constructor(_viewer: BaseViewerType);
    get camera_node(): import("../../nodes/obj/_BaseCamera").BaseCameraObjNodeType;
    get size(): Vector2;
    get aspect(): number;
    compute_size_and_aspect(): void;
    private _update_size;
    private _get_aspect;
    update_camera_aspect(): void;
    prepare_current_camera(): Promise<void>;
    _update_from_camera_container(): Promise<void>;
}

import { Vector2 } from 'three/src/math/Vector2';
import { BaseCameraObjNodeType } from '../../nodes/obj/_BaseCamera';
import { BaseViewer } from '../_Base';
export declare class CamerasController {
    private viewer;
    private _camera_node;
    private _size;
    private _aspect;
    constructor(viewer: BaseViewer);
    set_camera_node(camera_node: BaseCameraObjNodeType): Promise<void>;
    private _graph_node;
    private _update_graph_node;
    private _create_graph_node;
    get camera_node(): BaseCameraObjNodeType | null;
    get size(): Vector2;
    get aspect(): number;
    on_resize(): void;
    compute_size_and_aspect(): void;
    private _update_size;
    private _get_aspect;
    update_camera_aspect(): void;
    prepare_current_camera(): Promise<void>;
    _update_from_camera_container(): Promise<void>;
}

import { PolyScene } from '../PolyScene';
import { BaseCameraObjNodeType } from '../../nodes/obj/_BaseCamera';
export declare class CamerasController {
    private scene;
    constructor(scene: PolyScene);
    _master_camera_node_path: string | null;
    set_master_camera_node_path(camera_node_path: string): void;
    get master_camera_node_path(): string | null;
    get master_camera_node(): BaseCameraObjNodeType | null;
    private _find_any_camera;
}

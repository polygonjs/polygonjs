import { BaseCameraControlsEventNodeType, CameraControls } from '../_BaseCameraControls';
export declare class CameraControlsConfig {
    private _camera_node_id;
    private _controls_node;
    private _controls;
    private _update_required;
    constructor(_camera_node_id: string, _controls_node: BaseCameraControlsEventNodeType, _controls: CameraControls);
    update_required(): boolean;
    get camera_node_id(): string;
    get controls(): CameraControls;
    get controls_node(): BaseCameraControlsEventNodeType;
    is_equal(other_config: CameraControlsConfig): boolean;
}

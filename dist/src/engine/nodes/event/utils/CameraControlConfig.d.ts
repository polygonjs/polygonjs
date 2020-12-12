import { BaseCameraControlsEventNodeType, CameraControls } from '../_BaseCameraControls';
import { CoreGraphNodeId } from '../../../../core/graph/CoreGraph';
export declare class CameraControlsConfig {
    private _camera_node_id;
    private _controls_node;
    private _controls;
    private _update_required;
    constructor(_camera_node_id: CoreGraphNodeId, _controls_node: BaseCameraControlsEventNodeType, _controls: CameraControls);
    update_required(): boolean;
    get camera_node_id(): number;
    get controls(): any;
    get controls_node(): BaseCameraControlsEventNodeType;
    is_equal(other_config: CameraControlsConfig): boolean;
}

import { ThreejsViewer } from '../Threejs';
import { CameraControls } from '../../nodes/event/_BaseCameraControls';
import { CameraControlsConfig } from '../../nodes/event/utils/CameraControlConfig';
export declare class ViewerControlsController {
    private viewer;
    protected _active: boolean;
    protected _config: CameraControlsConfig | undefined;
    protected _controls: CameraControls | null;
    _bound_on_controls_start: () => void;
    _bound_on_controls_end: () => void;
    constructor(viewer: ThreejsViewer);
    get active(): boolean;
    get camera_node(): import("../../nodes/obj/_BaseCamera").BaseThreejsCameraObjNodeType;
    get controls(): CameraControls | null;
    create_controls(): Promise<void>;
    update(): void;
    dispose(): void;
    private _dispose_controls;
    private _on_controls_start;
    private _on_controls_end;
    private _graph_node;
    private _update_graph_node;
    private _create_graph_node;
}

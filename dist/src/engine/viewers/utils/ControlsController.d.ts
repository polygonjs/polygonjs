import { BaseViewer } from '../_Base';
import { CameraControls } from '../../nodes/event/_BaseCameraControls';
export declare class ControlsController {
    private viewer;
    protected _active: boolean;
    protected _controls: CameraControls | null;
    _bound_on_controls_start: () => void;
    _bound_on_controls_end: () => void;
    constructor(viewer: BaseViewer);
    get active(): boolean;
    get camera_node(): import("../../nodes/obj/_BaseCamera").BaseCameraObjNodeType | null;
    get controls(): CameraControls | null;
    create_controls(): Promise<void>;
    update(): void;
    dispose_controls(): void;
    private _on_controls_start;
    private _on_controls_end;
}

import { BaseCameraObjNodeType } from '../../_BaseCamera';
import { BaseCameraControlsEventNodeType, CameraControls } from '../../../event/_BaseCameraControls';
import { CameraControlsConfig } from '../../../event/utils/CameraControlConfig';
import { BaseParamType } from '../../../../params/_Base';
export declare class ControlsController {
    private node;
    _applied_controls_by_element_id: Dictionary<Dictionary<boolean>>;
    private _controls_node;
    private controls_start_listener;
    private controls_end_listener;
    constructor(node: BaseCameraObjNodeType);
    controls_param(): BaseParamType | null;
    controls_node(): Promise<BaseCameraControlsEventNodeType | null>;
    update_controls(): Promise<void>;
    apply_controls(html_element: HTMLElement): Promise<CameraControlsConfig | undefined>;
    dispose_control_refs(): void;
    dispose_controls(html_element: HTMLElement): Promise<void>;
    set_controls_events(controls: CameraControls): void;
    on_controls_start(controls: CameraControls): void;
    on_controls_end(controls: CameraControls): void;
}

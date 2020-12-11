import { BaseThreejsCameraObjNodeType } from '../../_BaseCamera';
import { BaseCameraControlsEventNodeType, CameraControls } from '../../../event/_BaseCameraControls';
import { CameraControlsConfig } from '../../../event/utils/CameraControlConfig';
import { BaseParamType } from '../../../../params/_Base';
export declare class ThreejsCameraControlsController {
    private node;
    private _applied_controls_by_element_id;
    private _controls_node;
    private controls_change_listener;
    private controls_end_listener;
    constructor(node: BaseThreejsCameraObjNodeType);
    controls_param(): BaseParamType | null;
    controls_node(): Promise<BaseCameraControlsEventNodeType | null>;
    update_controls(): Promise<void>;
    apply_controls(html_element: HTMLElement): Promise<CameraControlsConfig | undefined>;
    private _dispose_control_refs;
    private _dispose_controls_for_element_id;
    dispose_controls(html_element: HTMLElement): Promise<void>;
    set_controls_events(controls: CameraControls): void;
    private _set_controls_events_to_update_on_end;
    private _set_controls_events_to_update_always;
    private _update_camera_params;
}

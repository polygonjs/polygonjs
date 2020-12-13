import { Camera } from 'three/src/cameras/Camera';
import { TypedCameraControlsEventNode } from './_BaseCameraControls';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { OrbitControls } from '../../../modules/core/controls/OrbitControls';
import { CameraControlsNodeType } from '../../poly/NodeContext';
declare class CameraOrbitEventParamsConfig extends NodeParamsConfig {
    allow_pan: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    allow_rotate: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    allow_zoom: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    tdamping: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    damping: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    screen_space_panning: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    rotate_speed: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    min_distance: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    max_distance: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    limit_azimuth_angle: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    azimuth_angle_range: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR2>;
    polar_angle_range: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR2>;
    target: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
    enable_keys: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    keys_mode: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    keys_pan_speed: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    keys_rotate_speed_vertical: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    keys_rotate_speed_horizontal: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
}
export declare class CameraOrbitControlsEventNode extends TypedCameraControlsEventNode<CameraOrbitEventParamsConfig> {
    params_config: CameraOrbitEventParamsConfig;
    static type(): CameraControlsNodeType;
    initialize_node(): void;
    private _controls_by_element_id;
    create_controls_instance(camera: Camera, element: HTMLElement): Promise<OrbitControls>;
    protected _bind_listeners_to_controls_instance(controls: OrbitControls): void;
    setup_controls(controls: OrbitControls): void;
    private _set_azimuth_angle;
    update_required(): boolean;
    private _target_array;
    private _on_controls_end;
    static PARAM_CALLBACK_update_target(node: CameraOrbitControlsEventNode): void;
    private _update_target;
    dispose_controls_for_html_element_id(html_element_id: string): void;
}
export {};

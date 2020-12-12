import { TypedEventNode } from './_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class CameraNavigationBeaconsEventParamsConfig extends NodeParamsConfig {
    camera: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.OPERATOR_PATH>;
    init: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    init_camera: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.OPERATOR_PATH>;
    duration: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    rotation_delay: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    projection_matrix_delay: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    to_neares_pos: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    hide_current_beacon: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
}
export declare class CameraNavigationBeaconsEventNode extends TypedEventNode<CameraNavigationBeaconsEventParamsConfig> {
    params_config: CameraNavigationBeaconsEventParamsConfig;
    static type(): string;
    private _src_data;
    private _dest_data;
    private _prev_nav_beacons;
    private _current_nav_beacons;
    private _cam_proxy;
    private _nav_beacon_proxy;
    initialize_node(): void;
    private _process_init_event;
    private _process_trigger_event;
    private _start;
    private _animate_objects;
    private _animate_camera;
    private _get_src_camera;
    private _get_init_camera;
    private _get_clicked_camera;
    private _get_all_nav_beacon_objects;
    private _remove_current_camera_controls;
    private _restore_camera_controls;
    private static _store_cam_data;
    private _dest_delta;
    private _src_delta;
    private _dest_rot_m;
    private _dest_rot_m_up;
    private _compute_neares_pos;
}
export {};

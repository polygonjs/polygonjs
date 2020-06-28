import { Camera } from 'three/src/cameras/Camera';
import { TypedCameraControlsEventNode } from './_BaseCameraControls';
import { OrbitControls } from '../../../../modules/three/examples/jsm/controls/OrbitControls';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
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
    polar_angle_range: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR2>;
    target: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
}
export declare class CameraOrbitControlsEventNode extends TypedCameraControlsEventNode<CameraOrbitEventParamsConfig> {
    params_config: CameraOrbitEventParamsConfig;
    static type(): string;
    initialize_node(): void;
    private _controls_by_element_id;
    create_controls_instance(camera: Camera, element: HTMLElement): Promise<OrbitControls>;
    protected _bind_listeners_to_controls_instance(controls: OrbitControls): void;
    setup_controls(controls: OrbitControls): void;
    update_required(): boolean;
    private _target_array;
    private _on_controls_end;
    static PARAM_CALLBACK_update_target(node: CameraOrbitControlsEventNode): void;
    private _update_target;
}
export {};

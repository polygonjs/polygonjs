import { Camera } from 'three/src/cameras/Camera';
import { TypedCameraControlsEventNode, CameraControls } from './_BaseCameraControls';
import { BaseCameraObjNodeType } from '../obj/_BaseCamera';
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
}
export declare class CameraOrbitControlsEventNode extends TypedCameraControlsEventNode<CameraOrbitEventParamsConfig> {
    params_config: CameraOrbitEventParamsConfig;
    static type(): string;
    create_controls_instance(camera: Camera, element: HTMLElement): Promise<OrbitControls>;
    setup_controls(controls: OrbitControls): void;
    set_from_camera_node(controls: CameraControls, camera_node: BaseCameraObjNodeType): void;
}
export {};

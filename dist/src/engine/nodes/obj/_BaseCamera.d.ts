import { Camera } from 'three/src/cameras/Camera';
import { ControlsController } from './utils/cameras/ControlsController';
import { LayersController } from './utils/LayersController';
import { PostProcessController } from './utils/cameras/PostProcessController';
import { ThreejsViewer } from '../../viewers/Threejs';
import { BaseBackgroundController } from './utils/cameras/background/_BaseController';
export interface OrthoOrPerspCamera extends Camera {
    near: number;
    far: number;
    updateProjectionMatrix: () => void;
    getFocalLength?: () => void;
}
export declare const BASE_CAMERA_DEFAULT: {
    near: number;
    far: number;
};
import { FlagsControllerD } from '../utils/FlagsController';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { TransformController } from './utils/TransformController';
import { TypedObjNode } from './_Base';
export declare function CameraTransformParamConfig<TBase extends Constructor>(Base: TBase): {
    new (...args: any[]): {
        camera: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FOLDER>;
        controls: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.OPERATOR_PATH>;
        target: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
        near: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
        far: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
        set_master_camera: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BUTTON>;
    };
} & TBase;
declare const BaseCameraObjParamsConfig_base: {
    new (...args: any[]): {
        post_process: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FOLDER>;
        do_post_process: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
        use_post_process_node0: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
        post_process_node0: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.OPERATOR_PATH>;
        use_post_process_node1: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
        post_process_node1: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.OPERATOR_PATH>;
        use_post_process_node2: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
        post_process_node2: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.OPERATOR_PATH>;
        use_post_process_node3: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
        post_process_node3: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.OPERATOR_PATH>;
    };
} & {
    new (...args: any[]): {
        background: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FOLDER>;
        use_background: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
        use_material: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
        background_color: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.COLOR>;
        background_material: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.OPERATOR_PATH>;
        background_ratio: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    };
} & {
    new (...args: any[]): {
        transform: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FOLDER>;
        t: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
        r: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
        s: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
        scale: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    };
} & {
    new (...args: any[]): {
        layer: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    };
} & {
    new (...args: any[]): {
        camera: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FOLDER>;
        controls: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.OPERATOR_PATH>;
        target: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
        near: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
        far: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
        set_master_camera: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BUTTON>;
    };
} & typeof NodeParamsConfig;
export declare class BaseCameraObjParamsConfig extends BaseCameraObjParamsConfig_base {
}
export declare class TypedCameraObjNode<O extends OrthoOrPerspCamera, K extends BaseCameraObjParamsConfig> extends TypedObjNode<O, K> {
    readonly render_order: number;
    protected _object: O;
    protected _aspect: number;
    get object(): O;
    readonly transform_controller: TransformController;
    readonly flags: FlagsControllerD;
    protected _background_controller: BaseBackgroundController | undefined;
    get background_controller(): BaseBackgroundController;
    protected get background_controller_constructor(): typeof BaseBackgroundController;
    protected _controls_controller: ControlsController | undefined;
    get controls_controller(): ControlsController;
    protected _layers_controller: LayersController | undefined;
    get layers_controller(): LayersController;
    protected _post_process_controller: PostProcessController | undefined;
    get post_process_controller(): PostProcessController;
    initialize_base_node(): void;
    cook(): Promise<void>;
    on_create(): void;
    on_delete(): void;
    camera(): O;
    update_camera(): void;
    static PARAM_CALLBACK_set_master_camera(node: BaseCameraObjNodeType): void;
    set_as_master_camera(): void;
    setup_for_aspect_ratio(aspect: number): void;
    protected _update_for_aspect_ratio(): void;
    update_transform_params_from_object(): void;
    create_viewer(element: HTMLElement): ThreejsViewer;
}
export declare type BaseCameraObjNodeType = TypedCameraObjNode<OrthoOrPerspCamera, BaseCameraObjParamsConfig>;
export declare class BaseCameraObjNodeClass extends TypedCameraObjNode<OrthoOrPerspCamera, BaseCameraObjParamsConfig> {
}
export {};

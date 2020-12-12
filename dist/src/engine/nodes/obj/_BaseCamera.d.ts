import { Camera } from 'three/src/cameras/Camera';
import { ThreejsCameraControlsController } from './utils/cameras/ControlsController';
import { LayersController } from './utils/LayersController';
import { PostProcessController } from './utils/cameras/PostProcessController';
import { RenderController } from './utils/cameras/RenderController';
import { TransformController } from './utils/TransformController';
import { ChildrenDisplayController } from './utils/ChildrenDisplayController';
import { DisplayNodeController } from '../utils/DisplayNodeController';
import { NodeContext } from '../../poly/NodeContext';
import { ThreejsViewer, ThreejsViewerProperties } from '../../viewers/Threejs';
import { FlagsControllerD } from '../utils/FlagsController';
import { BaseParamType } from '../../params/_Base';
import { BaseNodeType } from '../_Base';
import { BaseSopNodeType } from '../sop/_Base';
import { TypedObjNode } from './_Base';
import { BaseViewerType } from '../../viewers/_Base';
import { HierarchyController } from './utils/HierarchyController';
import { GeoNodeChildrenMap } from '../../poly/registers/nodes/Sop';
import { ParamsInitData } from '../utils/io/IOController';
import { Raycaster } from 'three/src/core/Raycaster';
import { Vector2 } from 'three/src/math/Vector2';
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
export declare enum UpdateFromControlsMode {
    ON_END = "on move end",
    ALWAYS = "always",
    NEVER = "never"
}
export declare const UPDATE_FROM_CONTROLS_MODES: UpdateFromControlsMode[];
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
export declare function CameraMasterCameraParamConfig<TBase extends Constructor>(Base: TBase): {
    new (...args: any[]): {
        set_master_camera: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BUTTON>;
    };
} & TBase;
export declare function ThreejsCameraTransformParamConfig<TBase extends Constructor>(Base: TBase): {
    new (...args: any[]): {
        camera: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FOLDER>;
        controls: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.OPERATOR_PATH>;
        update_from_controls_mode: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
        allow_update_from_controls: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
        near: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
        far: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
        display: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    };
} & TBase;
declare const BaseCameraObjParamsConfig_base: {
    new (...args: any[]): {
        set_master_camera: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BUTTON>;
    };
} & typeof NodeParamsConfig;
export declare class BaseCameraObjParamsConfig extends BaseCameraObjParamsConfig_base {
}
declare const BaseThreejsCameraObjParamsConfig_base: {
    new (...args: any[]): {
        do_post_process: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
        post_process_node: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.OPERATOR_PATH>;
    };
} & {
    new (...args: any[]): {
        render: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FOLDER>;
        set_scene: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
        scene: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.OPERATOR_PATH>;
        set_renderer: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
        renderer: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.OPERATOR_PATH>;
        set_css_renderer: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
        css_renderer: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.OPERATOR_PATH>;
    };
} & {
    new (...args: any[]): {
        transform: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FOLDER>;
        keep_pos_when_parenting: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
        rotation_order: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
        t: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
        r: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
        s: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
        scale: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
        matrix_auto_update: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
        tlook_at: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
        look_at_pos: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
        up: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
    };
} & {
    new (...args: any[]): {
        layer: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    };
} & {
    new (...args: any[]): {
        camera: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FOLDER>;
        controls: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.OPERATOR_PATH>;
        update_from_controls_mode: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
        allow_update_from_controls: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
        near: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
        far: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
        display: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    };
} & {
    new (...args: any[]): {
        set_master_camera: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BUTTON>;
    };
} & typeof NodeParamsConfig;
export declare class BaseThreejsCameraObjParamsConfig extends BaseThreejsCameraObjParamsConfig_base {
}
export declare abstract class TypedCameraObjNode<O extends OrthoOrPerspCamera, K extends BaseCameraObjParamsConfig> extends TypedObjNode<O, K> {
    readonly render_order: number;
    protected _object: O;
    protected _aspect: number;
    get object(): O;
    cook(): Promise<void>;
    on_create(): void;
    on_delete(): void;
    prepare_raycaster(mouse: Vector2, raycaster: Raycaster): void;
    camera(): O;
    update_camera(): void;
    static PARAM_CALLBACK_set_master_camera(node: BaseCameraObjNodeType): void;
    set_as_master_camera(): void;
    setup_for_aspect_ratio(aspect: number): void;
    protected _update_for_aspect_ratio(): void;
    update_transform_params_from_object(): void;
    abstract create_viewer(element: HTMLElement): BaseViewerType;
    static PARAM_CALLBACK_update_from_param(node: BaseCameraObjNodeType, param: BaseParamType): void;
}
export declare class TypedThreejsCameraObjNode<O extends OrthoOrPerspCamera, K extends BaseThreejsCameraObjParamsConfig> extends TypedCameraObjNode<O, K> {
    readonly flags: FlagsControllerD;
    readonly hierarchy_controller: HierarchyController;
    readonly transform_controller: TransformController;
    protected _controls_controller: ThreejsCameraControlsController | undefined;
    get controls_controller(): ThreejsCameraControlsController;
    protected _layers_controller: LayersController | undefined;
    get layers_controller(): LayersController;
    protected _render_controller: RenderController | undefined;
    get render_controller(): RenderController;
    protected _post_process_controller: PostProcessController | undefined;
    get post_process_controller(): PostProcessController;
    readonly children_display_controller: ChildrenDisplayController;
    readonly display_node_controller: DisplayNodeController;
    protected _children_controller_context: NodeContext;
    initialize_base_node(): void;
    create_node<K extends keyof GeoNodeChildrenMap>(type: K, params_init_value_overrides?: ParamsInitData): GeoNodeChildrenMap[K];
    createNode<K extends valueof<GeoNodeChildrenMap>>(node_class: Constructor<K>, params_init_value_overrides?: ParamsInitData): K;
    children(): BaseSopNodeType[];
    nodes_by_type<K extends keyof GeoNodeChildrenMap>(type: K): GeoNodeChildrenMap[K][];
    prepare_raycaster(mouse: Vector2, raycaster: Raycaster): void;
    cook(): Promise<void>;
    static PARAM_CALLBACK_update_near_far_from_param(node: BaseThreejsCameraObjNodeType, param: BaseParamType): void;
    update_near_far(): void;
    setup_for_aspect_ratio(aspect: number): void;
    create_viewer(element: HTMLElement, viewer_properties?: ThreejsViewerProperties): ThreejsViewer;
    createViewer(element: HTMLElement, viewer_properties?: ThreejsViewerProperties): ThreejsViewer;
    static PARAM_CALLBACK_reset_effects_composer(node: BaseThreejsCameraObjNodeType): void;
}
export declare type BaseCameraObjNodeType = TypedCameraObjNode<OrthoOrPerspCamera, BaseCameraObjParamsConfig>;
export declare abstract class BaseCameraObjNodeClass extends TypedCameraObjNode<OrthoOrPerspCamera, BaseCameraObjParamsConfig> {
}
export declare type BaseThreejsCameraObjNodeType = TypedThreejsCameraObjNode<OrthoOrPerspCamera, BaseThreejsCameraObjParamsConfig>;
export declare class BaseThreejsCameraObjNodeClass extends TypedThreejsCameraObjNode<OrthoOrPerspCamera, BaseThreejsCameraObjParamsConfig> {
    PARAM_CALLBACK_update_effects_composer(node: BaseNodeType): void;
}
export {};

import { MapboxCameraObjNode } from '../../../obj/MapboxCamera';
import { TypedSopNode } from '../../_Base';
import { NodeParamsConfig } from '../../../utils/params/ParamsConfig';
export declare function MapboxListenerParamConfig<TBase extends Constructor>(Base: TBase): {
    new (...args: any[]): {
        use_bounds: import("../../../utils/params/ParamsConfig").ParamTemplate<import("../../../../poly/ParamType").ParamType.BOOLEAN>;
        south_west: import("../../../utils/params/ParamsConfig").ParamTemplate<import("../../../../poly/ParamType").ParamType.VECTOR2>;
        north_east: import("../../../utils/params/ParamsConfig").ParamTemplate<import("../../../../poly/ParamType").ParamType.VECTOR2>;
        use_zoom: import("../../../utils/params/ParamsConfig").ParamTemplate<import("../../../../poly/ParamType").ParamType.BOOLEAN>;
        zoom: import("../../../utils/params/ParamsConfig").ParamTemplate<import("../../../../poly/ParamType").ParamType.FLOAT>;
        mapbox_camera: import("../../../utils/params/ParamsConfig").ParamTemplate<import("../../../../poly/ParamType").ParamType.OPERATOR_PATH>;
        zoom_range: import("../../../utils/params/ParamsConfig").ParamTemplate<import("../../../../poly/ParamType").ParamType.VECTOR2>;
        update_always_allowed: import("../../../utils/params/ParamsConfig").ParamTemplate<import("../../../../poly/ParamType").ParamType.BOOLEAN>;
        update_always: import("../../../utils/params/ParamsConfig").ParamTemplate<import("../../../../poly/ParamType").ParamType.BOOLEAN>;
    };
} & TBase;
declare const MapboxListenerParamsConfig_base: {
    new (...args: any[]): {
        use_bounds: import("../../../utils/params/ParamsConfig").ParamTemplate<import("../../../../poly/ParamType").ParamType.BOOLEAN>;
        south_west: import("../../../utils/params/ParamsConfig").ParamTemplate<import("../../../../poly/ParamType").ParamType.VECTOR2>;
        north_east: import("../../../utils/params/ParamsConfig").ParamTemplate<import("../../../../poly/ParamType").ParamType.VECTOR2>;
        use_zoom: import("../../../utils/params/ParamsConfig").ParamTemplate<import("../../../../poly/ParamType").ParamType.BOOLEAN>;
        zoom: import("../../../utils/params/ParamsConfig").ParamTemplate<import("../../../../poly/ParamType").ParamType.FLOAT>;
        mapbox_camera: import("../../../utils/params/ParamsConfig").ParamTemplate<import("../../../../poly/ParamType").ParamType.OPERATOR_PATH>;
        zoom_range: import("../../../utils/params/ParamsConfig").ParamTemplate<import("../../../../poly/ParamType").ParamType.VECTOR2>;
        update_always_allowed: import("../../../utils/params/ParamsConfig").ParamTemplate<import("../../../../poly/ParamType").ParamType.BOOLEAN>;
        update_always: import("../../../utils/params/ParamsConfig").ParamTemplate<import("../../../../poly/ParamType").ParamType.BOOLEAN>;
    };
} & typeof NodeParamsConfig;
declare class MapboxListenerParamsConfig extends MapboxListenerParamsConfig_base {
}
export declare abstract class MapboxListenerSopNode<M extends MapboxListenerParamsConfig> extends TypedSopNode<M> {
    protected _mapbox_listener: MapboxListener;
    protected _camera_node: MapboxCameraObjNode | undefined;
    static PARAM_CALLBACK_update_mapbox_camera(node: MapboxListenerSopNode<MapboxListenerParamsConfig>): void;
    update_mapbox_camera(): void;
    get camera_node(): MapboxCameraObjNode | undefined;
    get camera_object(): import("three").PerspectiveCamera | undefined;
    find_camera_node(): MapboxCameraObjNode | undefined;
    abstract _post_init_controller(): void;
}
declare class MapboxListenerSopNodeWithParams extends MapboxListenerSopNode<MapboxListenerParamsConfig> {
    params_config: MapboxListenerParamsConfig;
    _post_init_controller(): void;
}
export declare class MapboxListener {
    private _node;
    private _current_camera_path;
    private _camera_controller;
    constructor(_node: MapboxListenerSopNodeWithParams);
    cook(): Promise<void>;
    _update_camera_controller(): void;
    _update_from_camera(): void;
}
export {};

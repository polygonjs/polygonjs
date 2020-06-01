import { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera';
import { TypedCameraObjNode } from './_BaseCamera';
import mapboxgl from 'mapbox-gl';
import { MapboxViewer } from '../../viewers/Mapbox';
import { NodeParamsConfig } from '..//utils/params/ParamsConfig';
declare const MapboxCameraObjParamConfig_base: {
    new (...args: any[]): {
        set_master_camera: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BUTTON>;
    };
} & typeof NodeParamsConfig;
declare class MapboxCameraObjParamConfig extends MapboxCameraObjParamConfig_base {
    style: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
    lng_lat: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR2>;
    zoom: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    zoom_range: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR2>;
    pitch: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    bearing: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    update_params_from_map: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BUTTON>;
    allow_drag_rotate: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    add_zoom_control: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
}
export declare class MapboxCameraObjNode extends TypedCameraObjNode<PerspectiveCamera, MapboxCameraObjParamConfig> {
    params_config: MapboxCameraObjParamConfig;
    static type(): Readonly<'mapbox_camera'>;
    private _maps_by_container_id;
    private _map_containers_by_container_id;
    private _canvases_by_container_id;
    private _controls_by_container_id;
    private _moving_maps;
    create_object(): PerspectiveCamera;
    cook(): Promise<void>;
    create_map(container: HTMLElement): mapboxgl.Map;
    update_maps(): void;
    update_map_from_container_id(container_id: string): void;
    update_map_nav(map: mapboxgl.Map): void;
    first_map(): mapboxgl.Map | undefined;
    first_id(): string | undefined;
    first_map_element(): HTMLElement | undefined;
    bounds(): mapboxgl.LngLatBounds | undefined;
    zoom(): number | undefined;
    center(): mapboxgl.LngLat | undefined;
    horizontal_lng_lat_points(): mapboxgl.LngLat[] | undefined;
    center_lng_lat_point(): mapboxgl.LngLat | undefined;
    vertical_far_lng_lat_points(): mapboxgl.LngLat[] | undefined;
    vertical_near_lng_lat_points(): mapboxgl.LngLat[] | undefined;
    remove_map(container: HTMLElement): void;
    on_move_end(container: HTMLElement): void;
    lng_lat(): {
        lng: number;
        lat: number;
    };
    camera_options_from_params(): {
        center: {
            lng: number;
            lat: number;
        };
        pitch: number;
        bearing: number;
        zoom: number;
    };
    camera_options_from_map(map: mapboxgl.Map): {
        center: mapboxgl.LngLat;
        pitch: number;
        bearing: number;
        zoom: number;
    };
    _add_remove_controls(map: mapboxgl.Map, container_id: string): void;
    update_params_from_map(): void;
    static PARAM_CALLBACK_update_params_from_map(node: MapboxCameraObjNode): void;
    static PARAM_CALLBACK_update_style(node: MapboxCameraObjNode): void;
    static PARAM_CALLBACK_update_nav(node: MapboxCameraObjNode): void;
    update_style(): void;
    update_nav(): void;
    create_viewer(element: HTMLElement): MapboxViewer;
}
export {};

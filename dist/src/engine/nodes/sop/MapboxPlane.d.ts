import { BufferGeometry } from 'three/src/core/BufferGeometry';
import { MapboxListenerSopNode } from './utils/mapbox/MapboxListener';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare const MapboxPlaneSopParamsConfig_base: {
    new (...args: any[]): {
        use_bounds: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
        south_west: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR2>;
        north_east: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR2>;
        use_zoom: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
        zoom: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
        mapbox_camera: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.OPERATOR_PATH>;
        zoom_range: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR2>;
        update_always_allowed: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
        update_always: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    };
} & typeof NodeParamsConfig;
declare class MapboxPlaneSopParamsConfig extends MapboxPlaneSopParamsConfig_base {
    type: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    resolution: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    size_mult: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    full_view: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    as_points: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    mapbox_transform: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
}
export declare class MapboxPlaneSopNode extends MapboxListenerSopNode<MapboxPlaneSopParamsConfig> {
    params_config: MapboxPlaneSopParamsConfig;
    static type(): string;
    private _hexagons_controller;
    cook(): void;
    _post_init_controller(): void;
    _build_plane(): BufferGeometry | undefined;
    private _mirror_lng_lat;
    private _as_hexagons;
}
export {};

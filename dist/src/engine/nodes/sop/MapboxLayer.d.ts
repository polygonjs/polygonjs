import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { MapboxListenerSopNode } from './utils/mapbox/MapboxListener';
declare const MapboxLayerSopParamsConfig_base: {
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
declare class MapboxLayerSopParamsConfig extends MapboxLayerSopParamsConfig_base {
    layers: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
}
export declare class MapboxLayerSopNode extends MapboxListenerSopNode<MapboxLayerSopParamsConfig> {
    params_config: MapboxLayerSopParamsConfig;
    static type(): string;
    cook(): void;
    _post_init_controller(): void;
    private _features_by_name;
    private _group_features_by_name;
    private _feature_name;
    private _id_from_feature;
}
export {};

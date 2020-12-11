import { CoreGroup } from '../../../core/geometry/Group';
import { MapboxListenerSopNode } from './utils/mapbox/MapboxListener';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare const MapboxTransformSopParamsConfig_base: {
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
declare class MapboxTransformSopParamsConfig extends MapboxTransformSopParamsConfig_base {
}
export declare class MapboxTransformSopNode extends MapboxListenerSopNode<MapboxTransformSopParamsConfig> {
    params_config: MapboxTransformSopParamsConfig;
    static type(): string;
    static displayed_input_names(): string[];
    initialize_node(): void;
    cook(input_contents: CoreGroup[]): void;
    transform_input(core_group: CoreGroup): void;
    _post_init_controller(): void;
}
export {};

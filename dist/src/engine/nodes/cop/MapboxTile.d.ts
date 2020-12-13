import { TypedCopNode } from './_Base';
export declare enum TileType {
    ELEVATION = "elevation",
    SATELLITE = "satellite"
}
export declare enum TileRes {
    LOW = 256,
    HIGH = 512
}
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class MapboxTileCopParamsConfig extends NodeParamsConfig {
    lng_lat: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR2>;
    zoom: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    type: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
}
export declare class MapboxTileCopNode extends TypedCopNode<MapboxTileCopParamsConfig> {
    params_config: MapboxTileCopParamsConfig;
    _param_hires: boolean;
    static type(): string;
    private _texture_loader;
    private _texture;
    initialize_node(): void;
    cook(): Promise<void>;
    private _cook_for_elevation;
    private _cook_for_satellite;
    private _url;
}
export {};

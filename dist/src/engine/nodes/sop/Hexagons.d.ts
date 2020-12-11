import { TypedSopNode } from './_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class HexagonsSopParamsConfig extends NodeParamsConfig {
    size: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR2>;
    hexagon_radius: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    direction: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
    points_only: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
}
export declare class HexagonsSopNode extends TypedSopNode<HexagonsSopParamsConfig> {
    params_config: HexagonsSopParamsConfig;
    static type(): string;
    private _core_transform;
    initialize_node(): void;
    cook(): void;
}
export {};

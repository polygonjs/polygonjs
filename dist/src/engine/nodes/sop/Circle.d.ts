import { TypedSopNode } from './_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class CircleSopParamsConfig extends NodeParamsConfig {
    radius: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    segments: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    open: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    arc_angle: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    direction: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
}
export declare class CircleSopNode extends TypedSopNode<CircleSopParamsConfig> {
    params_config: CircleSopParamsConfig;
    static type(): string;
    private _core_transform;
    initialize_node(): void;
    cook(): void;
    _create_circle(): void;
    _create_disk(): void;
}
export {};

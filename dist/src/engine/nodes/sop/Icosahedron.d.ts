import { TypedSopNode } from './_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class IcosahedronSopParamsConfig extends NodeParamsConfig {
    radius: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    detail: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    points_only: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    center: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
}
export declare class IcosahedronSopNode extends TypedSopNode<IcosahedronSopParamsConfig> {
    params_config: IcosahedronSopParamsConfig;
    static type(): string;
    private _operation;
    cook(): void;
}
export {};

import { TypedAnimNode } from './_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class TrackAnimParamsConfig extends NodeParamsConfig {
    name: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
    duration: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    sep1: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.SEPARATOR>;
    start_time: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    start_value: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    sep2: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.SEPARATOR>;
    end_time: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    end_value: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
}
export declare class TrackAnimNode extends TypedAnimNode<TrackAnimParamsConfig> {
    params_config: TrackAnimParamsConfig;
    static type(): string;
    cook(): void;
    private _create_track;
}
export {};

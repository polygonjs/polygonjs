import { TypedSopNode } from './_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class DataSopParamsConfig extends NodeParamsConfig {
    data: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
}
export declare class DataSopNode extends TypedSopNode<DataSopParamsConfig> {
    params_config: DataSopParamsConfig;
    static type(): string;
    cook(): void;
}
export {};

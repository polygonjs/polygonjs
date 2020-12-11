import { TypedCopNode } from './_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class SwitchCopParamsConfig extends NodeParamsConfig {
    input: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
}
export declare class SwitchCopNode extends TypedCopNode<SwitchCopParamsConfig> {
    params_config: SwitchCopParamsConfig;
    static type(): string;
    initialize_node(): void;
    cook(): Promise<void>;
}
export {};

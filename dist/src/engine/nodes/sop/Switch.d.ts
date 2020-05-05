import { TypedSopNode } from './_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class SwitchSopParamsConfig extends NodeParamsConfig {
    input: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
}
export declare class SwitchSopNode extends TypedSopNode<SwitchSopParamsConfig> {
    params_config: SwitchSopParamsConfig;
    static type(): string;
    static displayed_input_names(): string[];
    initialize_node(): void;
    cook(): Promise<void>;
}
export {};

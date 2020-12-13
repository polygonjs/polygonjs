import { TypedSopNode } from './_Base';
import { CoreGroup } from '../../../core/geometry/Group';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class PeakSopParamsConfig extends NodeParamsConfig {
    amount: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
}
export declare class PeakSopNode extends TypedSopNode<PeakSopParamsConfig> {
    params_config: PeakSopParamsConfig;
    static type(): string;
    initialize_node(): void;
    private _operation;
    cook(input_contents: CoreGroup[]): void;
}
export {};

import { TypedSopNode } from './_Base';
import { CoreGroup } from '../../../core/geometry/Group';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class AttribPromoteSopParamsConfig extends NodeParamsConfig {
    class_from: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    class_to: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    mode: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    name: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
}
export declare class AttribPromoteSopNode extends TypedSopNode<AttribPromoteSopParamsConfig> {
    params_config: AttribPromoteSopParamsConfig;
    static type(): string;
    initialize_node(): void;
    private _operation;
    cook(input_contents: CoreGroup[]): void;
}
export {};

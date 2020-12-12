import { TypedSopNode } from './_Base';
import { CoreGroup } from '../../../core/geometry/Group';
import { NormalizeMode } from '../../../core/operations/sop/AttribNormalize';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class AttribNormalizeSopParamsConfig extends NodeParamsConfig {
    mode: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    name: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
    change_name: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    new_name: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
}
export declare class AttribNormalizeSopNode extends TypedSopNode<AttribNormalizeSopParamsConfig> {
    params_config: AttribNormalizeSopParamsConfig;
    static type(): string;
    initialize_node(): void;
    set_mode(mode: NormalizeMode): void;
    private _operation;
    cook(input_contents: CoreGroup[]): void;
}
export {};

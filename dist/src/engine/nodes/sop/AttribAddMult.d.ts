import { TypedSopNode } from './_Base';
import { CoreGroup } from '../../../core/geometry/Group';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class AttribAddMultSopParamsConfig extends NodeParamsConfig {
    name: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
    pre_add: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    mult: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    post_add: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
}
export declare class AttribAddMultSopNode extends TypedSopNode<AttribAddMultSopParamsConfig> {
    params_config: AttribAddMultSopParamsConfig;
    static type(): string;
    initialize_node(): void;
    cook(input_contents: CoreGroup[]): void;
    private _update_attrib;
}
export {};

import { TypedSopNode } from './_Base';
import { CoreGroup } from '../../../core/geometry/Group';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class AttribFromTextureSopParamsConfig extends NodeParamsConfig {
    texture: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.NODE_PATH>;
    uv_attrib: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
    attrib: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
    add: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    mult: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
}
export declare class AttribFromTextureSopNode extends TypedSopNode<AttribFromTextureSopParamsConfig> {
    params_config: AttribFromTextureSopParamsConfig;
    static type(): string;
    initialize_node(): void;
    private _operation;
    cook(input_contents: CoreGroup[]): Promise<void>;
}
export {};

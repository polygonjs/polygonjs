import { TypedSopNode } from './_Base';
import { CoreGroup } from '../../../core/geometry/Group';
import { BufferAttribute } from 'three';
export declare enum NormalizeMode {
    MIN_MAX_TO_01 = "min/max to 0/1",
    VECTOR_TO_LENGTH_1 = "vectors to length 1"
}
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
    cook(input_contents: CoreGroup[]): void;
    private _normalize_attribute;
    private min3;
    private max3;
    private _normalize_from_min_max_to_01;
    private _vec;
    _normalize_vectors(src_attrib: BufferAttribute, dest_attrib: BufferAttribute): void;
}
export {};

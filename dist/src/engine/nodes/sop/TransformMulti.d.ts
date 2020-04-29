import { TypedSopNode } from './_Base';
import { CoreGroup } from '../../../core/geometry/Group';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class TransformMultiSopParamConfig extends NodeParamsConfig {
    count: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    rotation_order0: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    r0: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
    sep0: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.SEPARATOR>;
    rotation_order1: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    r1: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
    sep1: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.SEPARATOR>;
    rotation_order2: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    r2: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
    sep2: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.SEPARATOR>;
    rotation_order3: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    r3: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
    sep3: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.SEPARATOR>;
    rotation_order4: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    r4: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
    sep4: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.SEPARATOR>;
    rotation_order5: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    r5: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
    sep5: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.SEPARATOR>;
}
export declare class TransformMultiSopNode extends TypedSopNode<TransformMultiSopParamConfig> {
    params_config: TransformMultiSopParamConfig;
    static type(): string;
    static displayed_input_names(): string[];
    initialize_node(): void;
    private _core_transform;
    private _rot_and_index_pairs;
    cook(input_contents: CoreGroup[]): void;
    private _t;
    private _s;
    private _scale;
    private _matrix;
}
export {};

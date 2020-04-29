import { TypedSopNode } from './_Base';
import { CoreGroup } from '../../../core/geometry/Group';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class PhysicsRBDAttributesSopParamsConfig extends NodeParamsConfig {
    mode: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    active: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    shape: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    add_id: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    mass: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    restitution: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    damping: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    angular_damping: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    friction: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    simulated: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
}
export declare class PhysicsRBDAttributesSopNode extends TypedSopNode<PhysicsRBDAttributesSopParamsConfig> {
    params_config: PhysicsRBDAttributesSopParamsConfig;
    static type(): string;
    initialize_node(): void;
    cook(input_contents: CoreGroup[]): void;
    private _add_object_attributes;
    private _bbox_size;
    private _add_object_shape_specific_attributes;
    private _add_point_attributes;
}
export {};

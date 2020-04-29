import { TypedSopNode } from './_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { CoreGroup } from '../../../core/geometry/Group';
declare class PhysicsForceAttributesSopParamsConfig extends NodeParamsConfig {
    type: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    direction: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
    amount: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    max_distance: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    max_speed: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
}
export declare class PhysicsForceAttributesSopNode extends TypedSopNode<PhysicsForceAttributesSopParamsConfig> {
    params_config: PhysicsForceAttributesSopParamsConfig;
    static type(): string;
    initialize_node(): void;
    cook(input_contents: CoreGroup[]): void;
    private _apply_force_attributes;
    private _apply_attributes_directional;
    private _apply_attributes_radial;
    private _create_attributes_if_required;
}
export {};

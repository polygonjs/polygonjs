/**
 * Creates a sphere.
 *
 * @remarks
 * If the node has no input, you can control the radius and center of the sphere. If the node has an input, it will create a sphere that encompasses the input geometry.
 *
 */
import { TypedSopNode } from './_Base';
import { CoreGroup } from '../../../core/geometry/Group';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class SphereSopParamsConfig extends NodeParamsConfig {
    /** @param type of sphere (default sphere or isocahedron) */
    type: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    /** @param radius of the sphere when the type is default */
    radius: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    /** @param resolution - number of segments in x and y */
    resolution: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR2>;
    /** @param if set to 1, you can then set the phi_start, phi_end, theta_start and theta_end */
    open: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    /** @param start of phi angle */
    phi_start: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    /** @param length of phi opening */
    phi_length: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    /** @param start of theta angle */
    theta_start: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    /** @param length of theta opening */
    theta_length: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    /** @param resolution of the sphere when the type is isocahedron */
    detail: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    /** @param center of the sphere */
    center: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
}
export declare class SphereSopNode extends TypedSopNode<SphereSopParamsConfig> {
    params_config: SphereSopParamsConfig;
    static type(): string;
    initialize_node(): void;
    private _operation;
    cook(input_contents: CoreGroup[]): void;
}
export {};

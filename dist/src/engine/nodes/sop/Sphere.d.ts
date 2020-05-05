import { IcosahedronBufferGeometry } from 'three/src/geometries/IcosahedronGeometry';
import { TypedSopNode } from './_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { CoreGroup } from '../../../core/geometry/Group';
declare class SphereSopParamsConfig extends NodeParamsConfig {
    type: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    radius: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    resolution: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR2>;
    open: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    angle_range_x: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR2>;
    angle_range_y: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR2>;
    detail: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    center: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
}
export declare class SphereSopNode extends TypedSopNode<SphereSopParamsConfig> {
    params_config: SphereSopParamsConfig;
    static type(): string;
    initialize_node(): void;
    cook(input_contents: CoreGroup[]): void;
    private _cook_without_input;
    private _cook_with_input;
    private _create_required_geometry;
    private _create_default_sphere;
    _create_default_isocahedron(): IcosahedronBufferGeometry;
}
export {};

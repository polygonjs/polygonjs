import { Object3D } from 'three/src/core/Object3D';
import { MeshBasicMaterial } from 'three/src/materials/MeshBasicMaterial';
import { TypedSopNode } from './_Base';
import { CoreGroup } from '../../../core/geometry/Group';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class RaySopParamsConfig extends NodeParamsConfig {
    use_normals: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    direction: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
    transfer_face_normals: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
}
export declare class RaySopNode extends TypedSopNode<RaySopParamsConfig> {
    params_config: RaySopParamsConfig;
    static type(): string;
    private _bound_assign_mat;
    private _raycaster;
    static double_sided_material(): MeshBasicMaterial;
    static displayed_input_names(): string[];
    initialize_node(): void;
    create_params(): void;
    cook(input_contents: CoreGroup[]): void;
    ray(core_group: CoreGroup, core_group_collision: CoreGroup): void;
    _assign_double_sided_material_to_core_group(core_group: CoreGroup): void;
    _assign_double_sided_material_to_object(object: Object3D): void;
}
export {};

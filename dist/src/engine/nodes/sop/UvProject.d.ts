import { Object3D } from 'three/src/core/Object3D';
import { TypedSopNode } from './_Base';
import { CoreGroup } from '../../../core/geometry/Group';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class UvProjectSopParamsConfig extends NodeParamsConfig {
    camera: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.OPERATOR_PATH>;
}
export declare class UvProjectSopNode extends TypedSopNode<UvProjectSopParamsConfig> {
    params_config: UvProjectSopParamsConfig;
    static type(): string;
    private _camera_controller;
    private _processed_core_group;
    private _camera_object;
    initialize_node(): void;
    cook(core_groups: CoreGroup[]): void;
    _update_uvs_from_camera(look_at_target: Object3D): void;
    private _vector_in_camera_space;
}
export {};

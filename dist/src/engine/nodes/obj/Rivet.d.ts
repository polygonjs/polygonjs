import { TypedObjNode } from './_Base';
import { Group } from 'three/src/objects/Group';
import { FlagsControllerD } from '../utils/FlagsController';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { HierarchyController } from './utils/HierarchyController';
import { Object3D } from 'three/src/core/Object3D';
declare class RivetObjParamConfig extends NodeParamsConfig {
    object: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.OPERATOR_PATH>;
    point_index: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    update: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BUTTON>;
}
export declare class RivetObjNode extends TypedObjNode<Group, RivetObjParamConfig> {
    params_config: RivetObjParamConfig;
    static type(): string;
    readonly hierarchy_controller: HierarchyController;
    readonly flags: FlagsControllerD;
    private _helper;
    create_object(): Group;
    initialize_node(): void;
    cook(): void;
    static PARAM_CALLBACK_update_object_position(node: RivetObjNode): void;
    private _found_point_post;
    update_object_position(): void;
    update_object_position_from_object(observed_object: Object3D): void;
}
export {};

import { TypedObjNode } from './_Base';
import { Group } from 'three/src/objects/Group';
import { FlagsControllerD } from '../utils/FlagsController';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { HierarchyController } from './utils/HierarchyController';
declare class BlendObjParamConfig extends NodeParamsConfig {
    update: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BUTTON>;
}
export declare class BlendObjNode extends TypedObjNode<Group, BlendObjParamConfig> {
    params_config: BlendObjParamConfig;
    static type(): string;
    readonly hierarchy_controller: HierarchyController;
    readonly flags: FlagsControllerD;
    private _helper;
    create_object(): Group;
    initialize_node(): void;
    cook(): void;
    static PARAM_CALLBACK_cancel_parent_rotation(node: BlendObjNode): void;
    private _parent_quat;
    cancel_parent_rotation(): void;
}
export {};

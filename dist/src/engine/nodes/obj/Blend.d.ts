import { TypedObjNode } from './_Base';
import { Group } from 'three/src/objects/Group';
import { FlagsControllerD } from '../utils/FlagsController';
import { HierarchyController } from './utils/HierarchyController';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class BlendObjParamConfig extends NodeParamsConfig {
    object0: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.OPERATOR_PATH>;
    object1: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.OPERATOR_PATH>;
    mode: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    blend: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    blend_t: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    blend_r: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
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
    private _blend;
    private _t0;
    private _q0;
    private _s0;
    private _t1;
    private _q1;
    private _s1;
    private _blend_together;
    private _blend_separately;
    private _decompose_matrices;
}
export {};

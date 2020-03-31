import { TypedObjNode } from './_Base';
import { Group } from 'three/src/objects/Group';
import { TransformController } from './utils/TransformController';
import { FlagsControllerD } from '../utils/FlagsController';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare const NullObjParamConfig_base: {
    new (...args: any[]): {
        transform: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FOLDER>;
        t: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
        r: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
        s: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
        scale: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    };
} & typeof NodeParamsConfig;
declare class NullObjParamConfig extends NullObjParamConfig_base {
}
export declare class NullObjNode extends TypedObjNode<Group, NullObjParamConfig> {
    params_config: NullObjParamConfig;
    static type(): string;
    readonly transform_controller: TransformController;
    readonly flags: FlagsControllerD;
    private _helper;
    create_object(): Group;
    initialize_node(): void;
    cook(): void;
}
export {};

import { TypedLightObjNode } from './_BaseLight';
import { Light } from 'three/src/lights/Light';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { TransformController } from './utils/TransformController';
import { FlagsControllerD } from '../utils/FlagsController';
import { HierarchyController } from './utils/HierarchyController';
declare const TransformedObjParamConfig_base: {
    new (...args: any[]): {
        transform: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FOLDER>;
        rotation_order: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
        t: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
        r: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
        s: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
        scale: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
        matrix_auto_update: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    };
} & typeof NodeParamsConfig;
declare class TransformedObjParamConfig extends TransformedObjParamConfig_base {
}
export declare abstract class BaseLightTransformedObjNode<L extends Light, K extends TransformedObjParamConfig> extends TypedLightObjNode<L, K> {
    readonly flags: FlagsControllerD;
    readonly hierarchy_controller: HierarchyController;
    readonly transform_controller: TransformController;
    initialize_base_node(): void;
    cook(): void;
}
export {};

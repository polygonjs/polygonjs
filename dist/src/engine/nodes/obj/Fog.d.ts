import { TypedObjNode } from './_Base';
import { FogExp2 } from 'three/src/scenes/FogExp2';
import { Fog } from 'three/src/scenes/Fog';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { Object3D } from 'three/src/core/Object3D';
import { FlagsControllerD } from '../utils/FlagsController';
declare class FogObjParamConfig extends NodeParamsConfig {
    color: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.COLOR>;
    exponential: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    density: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    near: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    far: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
}
export declare class FogObjNode extends TypedObjNode<Object3D, FogObjParamConfig> {
    params_config: FogObjParamConfig;
    readonly flags: FlagsControllerD;
    readonly render_order: number;
    protected _attachable_to_hierarchy: boolean;
    protected _linear_fog: Fog;
    protected _linear_fogexp2: FogExp2;
    initialize_node(): void;
    static type(): string;
    cook(): void;
}
export {};

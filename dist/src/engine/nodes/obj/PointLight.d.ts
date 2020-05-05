import { PointLight } from 'three/src/lights/PointLight';
import { BaseLightTransformedObjNode } from './_BaseLightTransformed';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare const PointLightObjParamsConfig_base: {
    new (...args: any[]): {
        transform: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FOLDER>;
        rotation_order: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
        t: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
        r: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
        s: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
        scale: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    };
} & typeof NodeParamsConfig;
declare class PointLightObjParamsConfig extends PointLightObjParamsConfig_base {
    light: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FOLDER>;
    color: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.COLOR>;
    intensity: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    decay: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    distance: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    cast_shadows: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    shadow_res: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR2>;
    shadow_bias: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    shadow_near: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    shadow_far: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    show_helper: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    helper_size: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
}
export declare class PointLightObjNode extends BaseLightTransformedObjNode<PointLight, PointLightObjParamsConfig> {
    params_config: PointLightObjParamsConfig;
    static type(): string;
    private _helper_controller;
    initialize_node(): void;
    create_light(): PointLight;
    update_light_params(): void;
    update_shadow_params(): void;
}
export {};

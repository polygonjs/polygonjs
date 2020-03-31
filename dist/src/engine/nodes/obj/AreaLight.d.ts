import { RectAreaLight } from 'three/src/lights/RectAreaLight';
import { BaseLightTransformedObjNode } from './_BaseLightTransformed';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
export declare function AreaLightParamConfig<TBase extends Constructor>(Base: TBase): {
    new (...args: any[]): {
        color: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.COLOR>;
        intensity: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
        width: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
        height: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    };
} & TBase;
declare const AreaLightObjParamsConfig_base: {
    new (...args: any[]): {
        color: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.COLOR>;
        intensity: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
        width: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
        height: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    };
} & {
    new (...args: any[]): {
        transform: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FOLDER>;
        t: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
        r: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
        s: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
        scale: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    };
} & typeof NodeParamsConfig;
declare class AreaLightObjParamsConfig extends AreaLightObjParamsConfig_base {
}
export declare class AreaLightObjNode extends BaseLightTransformedObjNode<RectAreaLight, AreaLightObjParamsConfig> {
    params_config: AreaLightObjParamsConfig;
    static type(): string;
    create_light(): RectAreaLight;
    update_light_params(): void;
    cook(): Promise<void>;
}
export {};

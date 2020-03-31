import { PointsMaterial } from 'three/src/materials/PointsMaterial';
import { TypedMatNode } from './_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
export declare function PointsParamConfig<TBase extends Constructor>(Base: TBase): {
    new (...args: any[]): {
        size: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
        size_attenuation: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    };
} & TBase;
declare const PointsMatParamsConfig_base: {
    new (...args: any[]): {
        double_sided: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
        front: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    };
} & {
    new (...args: any[]): {
        color: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.COLOR>;
        use_vertex_colors: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
        transparent: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
        opacity: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
        alpha_test: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
        use_fog: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    };
} & {
    new (...args: any[]): {
        size: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
        size_attenuation: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    };
} & typeof NodeParamsConfig;
declare class PointsMatParamsConfig extends PointsMatParamsConfig_base {
}
export declare class PointsMatNode extends TypedMatNode<PointsMaterial, PointsMatParamsConfig> {
    params_config: PointsMatParamsConfig;
    static type(): string;
    create_material(): PointsMaterial;
    cook(): Promise<void>;
}
export {};

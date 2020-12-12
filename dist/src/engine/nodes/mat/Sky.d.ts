import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';
import { TypedMatNode } from './_Base';
import { Vector3 } from 'three/src/math/Vector3';
interface ShaderMaterialWithSkyUniforms extends ShaderMaterial {
    uniforms: {
        turbidity: {
            value: number;
        };
        rayleigh: {
            value: number;
        };
        mieCoefficient: {
            value: number;
        };
        mieDirectionalG: {
            value: number;
        };
        sunPosition: {
            value: Vector3;
        };
        up: {
            value: Vector3;
        };
    };
}
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class SkyMatParamsConfig extends NodeParamsConfig {
    turbidity: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    rayleigh: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    mie_coefficient: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    mie_directional: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    inclination: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    azimuth: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    up: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
}
export declare class SkyMatNode extends TypedMatNode<ShaderMaterialWithSkyUniforms, SkyMatParamsConfig> {
    params_config: SkyMatParamsConfig;
    static type(): string;
    create_material(): ShaderMaterialWithSkyUniforms;
    cook(): Promise<void>;
}
export {};

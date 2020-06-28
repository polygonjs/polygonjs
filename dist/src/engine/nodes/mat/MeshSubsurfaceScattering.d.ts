import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';
import { TypedMatNode } from './_Base';
import { TextureMapController } from './utils/TextureMapController';
import { TextureAlphaMapController } from './utils/TextureAlphaMapController';
import { BaseParamType } from '../../params/_Base';
import { IUniformN, IUniformTexture, IUniformColor } from '../utils/code/gl/Uniforms';
import { IUniform } from 'three/src/renderers/shaders/UniformsLib';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { OperatorPathParam } from '../../params/OperatorPath';
declare const MeshSubsurfaceScatteringMatParamsConfig_base: {
    new (...args: any[]): {
        use_map: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
        map: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.OPERATOR_PATH>;
    };
} & {
    new (...args: any[]): {
        use_alpha_map: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
        alpha_map: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.OPERATOR_PATH>;
    };
} & {
    new (...args: any[]): {
        skinning: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    };
} & {
    new (...args: any[]): {
        double_sided: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
        front: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    };
} & typeof NodeParamsConfig;
declare class MeshSubsurfaceScatteringMatParamsConfig extends MeshSubsurfaceScatteringMatParamsConfig_base {
    diffuse: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.COLOR>;
    shininess: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    thickness_map: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.OPERATOR_PATH>;
    thickness_color: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.COLOR>;
    thickness_distortion: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    thickness_ambient: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    thickness_attenuation: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    thickness_power: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    thickness_scale: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
}
interface ShaderMaterialWithUniforms extends ShaderMaterial {
    uniforms: {
        diffuse: IUniformColor;
        shininess: IUniformN;
        thicknessMap: IUniformTexture;
        thicknessColor: IUniformColor;
        thicknessDistortion: IUniformN;
        thicknessAmbient: IUniformN;
        thicknessAttenuation: IUniformN;
        thicknessPower: IUniformN;
        thicknessScale: IUniformN;
        [uniform: string]: IUniform;
    };
}
export declare class MeshSubsurfaceScatteringMatNode extends TypedMatNode<ShaderMaterialWithUniforms, MeshSubsurfaceScatteringMatParamsConfig> {
    params_config: MeshSubsurfaceScatteringMatParamsConfig;
    static type(): string;
    create_material(): ShaderMaterialWithUniforms;
    readonly texture_map_controller: TextureMapController;
    readonly texture_alpha_map_controller: TextureAlphaMapController;
    initialize_node(): void;
    cook(): Promise<void>;
    static PARAM_CALLBACK_update_uniformN(node: MeshSubsurfaceScatteringMatNode, param: BaseParamType, uniform_name: string): void;
    static PARAM_CALLBACK_update_uniformColor(node: MeshSubsurfaceScatteringMatNode, param: BaseParamType, uniform_name: string): void;
    static PARAM_CALLBACK_update_uniformTexture(node: MeshSubsurfaceScatteringMatNode, param: BaseParamType, uniform_name: string): void;
    update_map(param: OperatorPathParam, uniform_name: string): Promise<void>;
}
export {};

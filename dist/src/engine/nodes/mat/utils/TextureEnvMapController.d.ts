import { Material } from 'three/src/materials/Material';
import { Texture } from 'three/src/textures/Texture';
import { TypedMatNode } from '../_Base';
import { BaseTextureMapController, UpdateOptions } from './_BaseTextureController';
import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';
import { NodeParamsConfig } from '../../utils/params/ParamsConfig';
export declare function TextureEnvMapParamConfig<TBase extends Constructor>(Base: TBase): {
    new (...args: any[]): {
        use_env_map: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.BOOLEAN>;
        env_map: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.OPERATOR_PATH>;
        env_map_intensity: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.FLOAT>;
    };
} & TBase;
declare class TextureEnvMaterial extends Material {
    envMap: Texture | null;
}
declare type CurrentMaterial = TextureEnvMaterial | ShaderMaterial;
declare const TextureEnvMapParamsConfig_base: {
    new (...args: any[]): {
        use_env_map: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.BOOLEAN>;
        env_map: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.OPERATOR_PATH>;
        env_map_intensity: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.FLOAT>;
    };
} & typeof NodeParamsConfig;
declare class TextureEnvMapParamsConfig extends TextureEnvMapParamsConfig_base {
}
declare abstract class TextureEnvMapMatNode extends TypedMatNode<CurrentMaterial, TextureEnvMapParamsConfig> {
    texture_env_map_controller: TextureEnvMapController;
    abstract create_material(): CurrentMaterial;
}
export declare class TextureEnvMapController extends BaseTextureMapController {
    constructor(node: TextureEnvMapMatNode, _update_options: UpdateOptions);
    initialize_node(): void;
    update(): Promise<void>;
    static update(node: TextureEnvMapMatNode): Promise<void>;
}
export {};

import { Material } from 'three/src/materials/Material';
import { Texture } from 'three/src/textures/Texture';
import { TypedMatNode } from '../_Base';
import { BaseTextureMapController, UpdateOptions } from './_BaseTextureController';
import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';
import { NodeParamsConfig } from '../../utils/params/ParamsConfig';
export declare function TextureAlphaMapParamConfig<TBase extends Constructor>(Base: TBase): {
    new (...args: any[]): {
        use_alpha_map: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.BOOLEAN>;
        alpha_map: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.OPERATOR_PATH>;
    };
} & TBase;
declare class TextureAlphaMaterial extends Material {
    alphaMap: Texture | null;
}
declare type CurrentMaterial = TextureAlphaMaterial | ShaderMaterial;
declare const TextureAlphaMapParamsConfig_base: {
    new (...args: any[]): {
        use_alpha_map: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.BOOLEAN>;
        alpha_map: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.OPERATOR_PATH>;
    };
} & typeof NodeParamsConfig;
declare class TextureAlphaMapParamsConfig extends TextureAlphaMapParamsConfig_base {
}
declare abstract class TextureAlphaMapMatNode extends TypedMatNode<CurrentMaterial, TextureAlphaMapParamsConfig> {
    texture_alpha_map_controller: TextureAlphaMapController;
    abstract create_material(): CurrentMaterial;
}
export declare class TextureAlphaMapController extends BaseTextureMapController {
    constructor(node: TextureAlphaMapMatNode, _update_options: UpdateOptions);
    initialize_node(): void;
    update(): Promise<void>;
    static update(node: TextureAlphaMapMatNode): Promise<void>;
}
export {};

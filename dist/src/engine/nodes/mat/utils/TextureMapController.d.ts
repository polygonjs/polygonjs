import { Material } from 'three/src/materials/Material';
import { Texture } from 'three/src/textures/Texture';
import { TypedMatNode } from '../_Base';
import { BaseTextureMapController, UpdateOptions } from './_BaseTextureController';
import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';
import { NodeParamsConfig } from '../../utils/params/ParamsConfig';
export declare function TextureMapParamConfig<TBase extends Constructor>(Base: TBase): {
    new (...args: any[]): {
        use_map: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.BOOLEAN>;
        map: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.OPERATOR_PATH>;
    };
} & TBase;
declare class TextureMapMaterial extends Material {
    map: Texture | null;
}
declare type CurrentMaterial = TextureMapMaterial | ShaderMaterial;
declare const TextureMapParamsConfig_base: {
    new (...args: any[]): {
        use_map: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.BOOLEAN>;
        map: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.OPERATOR_PATH>;
    };
} & typeof NodeParamsConfig;
declare class TextureMapParamsConfig extends TextureMapParamsConfig_base {
}
declare abstract class TextureMapMatNode extends TypedMatNode<CurrentMaterial, TextureMapParamsConfig> {
    texture_map_controller: TextureMapController;
    abstract create_material(): CurrentMaterial;
}
export declare class TextureMapController extends BaseTextureMapController {
    protected node: TextureMapMatNode;
    constructor(node: TextureMapMatNode, _update_options: UpdateOptions);
    initialize_node(): void;
    update(): Promise<void>;
    static update(node: TextureMapMatNode): Promise<void>;
}
export {};

import { BaseController } from './_BaseController';
import { Material } from 'three/src/materials/Material';
import { Texture } from 'three/src/textures/Texture';
import { BaseMatNodeType } from '../_Base';
import { NodeContext } from '../../../poly/NodeContext';
import { OperatorPathParam } from '../../../params/OperatorPath';
import { BooleanParam } from '../../../params/Boolean';
import { BaseNodeType } from '../../_Base';
import { BaseParamType } from '../../../params/_Base';
import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';
import { IUniform } from 'three/src/renderers/shaders/UniformsLib';
export declare function TextureMapParamConfig<TBase extends Constructor>(Base: TBase): {
    new (...args: any[]): {
        use_map: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.BOOLEAN>;
        map: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.OPERATOR_PATH>;
    };
} & TBase;
declare type FilterFlags<Base, Condition> = {
    [Key in keyof Base]: Base[Key] extends Condition ? Key : never;
};
declare type AllowedNames<Base, Condition> = FilterFlags<Base, Condition>[keyof Base];
declare type SubType<Base, Condition> = Pick<Base, AllowedNames<Base, Condition>>;
export declare function BooleanParamOptions(controller_class: typeof BaseTextureMapController): {
    cook: boolean;
    callback: (node: BaseNodeType, param: BaseParamType) => void;
};
export declare function OperatorPathOptions(controller: typeof BaseTextureMapController, use_map_name: string): {
    visible_if: {
        [x: string]: number;
    };
    node_selection: {
        context: NodeContext;
    };
    cook: boolean;
    callback: (node: BaseNodeType, param: BaseParamType) => void;
};
declare type CurrentMaterial = Material | ShaderMaterial;
export interface UpdateOptions {
    direct_params?: boolean;
    uniforms?: boolean;
    define?: boolean;
}
export declare class BaseTextureMapController extends BaseController {
    protected node: BaseMatNodeType;
    protected _update_options: UpdateOptions;
    constructor(node: BaseMatNodeType, _update_options: UpdateOptions);
    protected add_hooks(use_map_param: BooleanParam, path_param: OperatorPathParam): void;
    static update(node: BaseNodeType): void;
    _update<M extends CurrentMaterial>(material: M, mat_attrib_name: string, use_map_param: BooleanParam, path_param: OperatorPathParam): Promise<void>;
    _update_texture_on_uniforms<O extends IUniform>(material: ShaderMaterial, mat_attrib_name: keyof SubType<O, Texture | null>, use_map_param: BooleanParam, path_param: OperatorPathParam): Promise<void>;
    private _apply_texture_on_uniforms;
    private _remove_texture_from_uniforms;
    private _define_name;
    _update_texture_on_material<M extends Material>(material: M, mat_attrib_name: keyof SubType<M, Texture | null>, use_map_param: BooleanParam, path_param: OperatorPathParam): Promise<void>;
    private _apply_texture_on_material;
    private _remove_texture_from_material;
    private _update_required_attribute;
    private _do_update_define;
}
export {};

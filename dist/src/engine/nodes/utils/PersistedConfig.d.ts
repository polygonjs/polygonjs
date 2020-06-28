import { BaseNodeType } from '../_Base';
import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';
import { ShaderMaterialWithCustomMaterials } from '../../../core/geometry/Material';
interface MaterialData {
    color?: boolean;
    lights?: boolean;
}
export declare class BasePersistedConfig {
    protected node: BaseNodeType;
    constructor(node: BaseNodeType);
    to_json(): object | void;
    load(data: object): void;
    protected _material_to_json(material: ShaderMaterial): object;
    private _found_texture_by_id;
    private _found_textures_id_by_uniform_name;
    private _unassign_textures;
    private _reassign_textures;
    protected _load_material(data: MaterialData): ShaderMaterialWithCustomMaterials | undefined;
    private mat4_to_mat3;
}
export {};

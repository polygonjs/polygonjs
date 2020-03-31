import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';
import { Object3D } from 'three/src/core/Object3D';
import { Mesh } from 'three/src/objects/Mesh';
import { Material } from 'three/src/materials/Material';
import { PolyScene } from '../../engine/scene/PolyScene';
import { IUniform } from 'three/src/renderers/shaders/UniformsLib';
export interface IUniforms {
    [uniform: string]: IUniform;
}
export interface MaterialWithUniforms extends Material {
    uniforms: IUniforms;
}
declare enum CustomMaterialName {
    customDistanceMaterial = "customDistanceMaterial",
    customDepthMaterial = "customDepthMaterial",
    customDepthDOFMaterial = "customDepthDOFMaterial"
}
export interface ObjectWithCustomMaterials extends Mesh {
    customDepthDOFMaterial?: Material;
}
export interface ShaderMaterialWithCustomMaterials extends ShaderMaterial {
    custom_materials: {
        [key in CustomMaterialName]?: ShaderMaterial;
    };
}
export interface MaterialWithSkinning extends Material {
    skinning: boolean;
    morphTargets: boolean;
}
export declare class CoreMaterial {
    static node(scene: PolyScene, material: Material): import("../../engine/nodes/manager/ObjectsManager").ObjectsManagerNode | import("../../engine/nodes/_Base").BaseNodeType | null;
    static clone(src_material: Material | Material[]): Material | Material[];
    static clone_single(src_material: Material): Material;
    static apply_custom_materials(object: Object3D, material: Material): void;
    static assign_custom_uniforms(mat: Material, uniform_name: string, uniform_value: any): void;
    static init_custom_material_uniforms(mat: Material, uniform_name: string, uniform_value: any): void;
}
export {};

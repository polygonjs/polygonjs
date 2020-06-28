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
import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';
import { Scene } from 'three/src/scenes/Scene';
import { Camera } from 'three/src/cameras/Camera';
import { BufferGeometry } from 'three/src/core/BufferGeometry';
import { Geometry } from 'three/src/core/Geometry';
import { Group } from 'three/src/objects/Group';
export declare type RenderHook = (renderer: WebGLRenderer, scene: Scene, camera: Camera, geometry: BufferGeometry | Geometry, material: Material, group: Group | null) => void;
export declare type RenderHookWithObject = (renderer: WebGLRenderer, scene: Scene, camera: Camera, geometry: BufferGeometry | Geometry, material: Material, group: Group | null, // it's only 'Group', and not 'Group|null' in threejs types, but got null sometimes
object: Object3D) => void;
declare const RENDER_HOOK_USER_DATA_KEY = "POLY_render_hook";
interface MaterialWithRenderHook {
    userData: {
        [RENDER_HOOK_USER_DATA_KEY]: RenderHookWithObject;
    };
}
export declare class CoreMaterial {
    static node(scene: PolyScene, material: Material): import("../../engine/nodes/_Base").BaseNodeType | import("../../engine/nodes/manager/ObjectsManager").ObjectsManagerNode | null;
    static add_user_data_render_hook(material: Material, render_hook: RenderHookWithObject): void;
    static apply_render_hook(object: Object3D, material: MaterialWithRenderHook): void;
    static apply_custom_materials(object: Object3D, material: Material): void;
    static assign_custom_uniforms(mat: Material, uniform_name: string, uniform_value: any): void;
    static init_custom_material_uniforms(mat: Material, uniform_name: string, uniform_value: any): void;
}
export {};

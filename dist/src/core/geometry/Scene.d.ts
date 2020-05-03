import { Scene } from 'three/src/scenes/Scene';
import { Material } from 'three/src/materials/Material';
import { IUniform } from 'three/src/renderers/shaders/UniformsLib';
interface Uniforms {
    [propName: string]: IUniform;
}
export declare class CoreScene {
    private _scene;
    constructor(_scene: Scene);
    scene(): Scene;
    with_overriden_material(base_material: Material, instance_material: Material, uniforms: Uniforms, callback: () => void): void;
}
export {};

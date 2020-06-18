import { PolyScene } from '../PolyScene';
import { Vector2 } from 'three/src/math/Vector2';
import { IUniform } from 'three/src/renderers/shaders/UniformsLib';
declare type IUniforms = Dictionary<IUniform>;
export interface IUniformsWithTime extends IUniforms {
    time: IUniform;
}
export interface IUniformsWithResolution extends IUniforms {
    resolution: {
        value: Vector2Like;
    };
}
export declare class UniformsController {
    private scene;
    constructor(scene: PolyScene);
    private _time_dependent_uniform_owners;
    private _time_dependent_uniform_owners_ids;
    private _resolution;
    private _resolution_dependent_uniform_owners;
    private _resolution_dependent_uniform_owners_ids;
    add_time_dependent_uniform_owner(id: string, uniforms: IUniformsWithTime): void;
    remove_time_dependent_uniform_owner(id: string): void;
    protected _update_time_dependent_uniform_owners_ids(): void;
    update_time_dependent_uniform_owners(): void;
    add_resolution_dependent_uniform_owner(id: string, uniforms: IUniformsWithResolution): void;
    remove_resolution_dependent_uniform_owner(id: string): void;
    protected _update_resolution_dependent_uniform_owners_ids(): void;
    update_resolution_dependent_uniform_owners(resolution: Vector2): void;
    update_resolution_dependent_uniforms(uniforms: IUniformsWithResolution): void;
}
export {};

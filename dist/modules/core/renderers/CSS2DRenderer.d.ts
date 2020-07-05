import { Object3D } from 'three/src/core/Object3D';
import { CSS2DObject } from '../objects/CSS2DObject';
import { Scene } from 'three/src/scenes/Scene';
import { Camera } from 'three/src/cameras/Camera';
export declare class CSS2DRenderer {
    private _width;
    private _height;
    private _widthHalf;
    private _heightHalf;
    private vector;
    private viewMatrix;
    private viewProjectionMatrix;
    private cache_distanceToCameraSquared;
    readonly domElement: HTMLDivElement;
    private _sort_objects;
    private _use_fog;
    private _fog_near;
    private _fog_far;
    constructor();
    getSize(): {
        width: number;
        height: number;
    };
    setSize(width: number, height: number): void;
    renderObject(object: Object3D, scene: Scene, camera: Camera): void;
    private a;
    private b;
    getDistanceToSquared(object1: Object3D, object2: Object3D): number;
    filterAndFlatten(scene: Scene): CSS2DObject[];
    render(scene: Scene, camera: Camera): void;
    set_sorting(state: boolean): void;
    zOrder(scene: Scene): void;
    set_use_fog(state: boolean): void;
    set_fog_range(near: number, far: number): void;
}

import { Object3D } from 'three/src/core/Object3D';
export declare class CSS2DObject extends Object3D {
    protected _element: HTMLElement;
    constructor(_element: HTMLElement);
    private _on_removed;
    get element(): HTMLElement;
    copy(source: CSS2DObject, recursive: boolean): this;
}

import { PolyScene } from '../PolyScene';
export declare class LifeCycleController {
    private scene;
    constructor(scene: PolyScene);
    private _lifecycle_on_create_allowed;
    on_create_hook_allowed(): boolean;
    on_create_prevent(callback: () => void): void;
}

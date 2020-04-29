import { BaseViewerType } from '../../viewers/_Base';
import { PolyScene } from '../..';
export declare class ViewersRegister {
    protected scene: PolyScene;
    private _viewers_by_id;
    constructor(scene: PolyScene);
    register_viewer(viewer: BaseViewerType): void;
    unregister_viewer(viewer: BaseViewerType): void;
    traverse_viewers(callback: (viewer: BaseViewerType) => void): void;
}

import { PolyScene } from '../scene/PolyScene';
import { BaseViewer } from './_Base';
import { BaseCameraObjNodeType } from '../nodes/obj/_BaseCamera';
declare global {
    interface HTMLCanvasElement {
        onwebglcontextlost: () => void;
        onwebglcontextrestored: () => void;
    }
}
export declare class ThreejsViewer extends BaseViewer {
    protected _scene: PolyScene;
    private _request_animation_frame_id;
    private do_render;
    private _animate_method;
    constructor(_container: HTMLElement, _scene: PolyScene, camera_node: BaseCameraObjNodeType);
    _build(): void;
    dispose(): void;
    private _set_events;
    private _init_display;
    animate(): void;
    private _cancel_animate;
    render(): void;
}

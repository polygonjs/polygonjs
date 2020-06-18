import { PolyScene } from '../scene/PolyScene';
import { ViewerControlsController } from './utils/ControlsController';
import { TypedViewer } from './_Base';
import { BaseThreejsCameraObjNodeType } from '../nodes/obj/_BaseCamera';
declare global {
    interface HTMLCanvasElement {
        onwebglcontextlost: () => void;
        onwebglcontextrestored: () => void;
    }
}
export declare class ThreejsViewer extends TypedViewer<BaseThreejsCameraObjNodeType> {
    protected _scene: PolyScene;
    protected _camera_node: BaseThreejsCameraObjNodeType;
    private _request_animation_frame_id;
    private do_render;
    private _animate_method;
    constructor(_container: HTMLElement, _scene: PolyScene, _camera_node: BaseThreejsCameraObjNodeType);
    get controls_controller(): ViewerControlsController;
    _build(): void;
    dispose(): void;
    get camera_controls_controller(): import("../nodes/obj/utils/cameras/ControlsController").ThreejsCameraControlsController;
    private _set_events;
    on_resize(): void;
    private _init_display;
    animate(): void;
    private _cancel_animate;
    render(): void;
}

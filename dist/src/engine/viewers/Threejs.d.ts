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
export interface ThreejsViewerProperties {
    auto_render: boolean;
}
export declare class ThreejsViewer extends TypedViewer<BaseThreejsCameraObjNodeType> {
    protected _scene: PolyScene;
    protected _camera_node: BaseThreejsCameraObjNodeType;
    private _properties?;
    private _request_animation_frame_id;
    private _do_render;
    private _animate_method;
    constructor(_container: HTMLElement, _scene: PolyScene, _camera_node: BaseThreejsCameraObjNodeType, _properties?: ThreejsViewerProperties | undefined);
    get controls_controller(): ViewerControlsController;
    _build(): void;
    dispose(): void;
    get camera_controls_controller(): import("../nodes/obj/utils/cameras/ControlsController").ThreejsCameraControlsController;
    private _set_events;
    on_resize(): void;
    private _init_display;
    set_auto_render(state?: boolean): void;
    animate(): void;
    private _cancel_animate;
    render(): void;
    renderer(): import("three").WebGLRenderer | undefined;
}

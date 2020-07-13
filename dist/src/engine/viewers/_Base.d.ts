import { PolyScene } from '../scene/PolyScene';
import { BaseCameraObjNodeType } from '../nodes/obj/_BaseCamera';
import { ViewerCamerasController } from './utils/CamerasController';
import { ViewerControlsController } from './utils/ControlsController';
import { ViewerEventsController } from './utils/EventsController';
import { WebGLController } from './utils/WebglController';
import { ThreejsCameraControlsController } from '../nodes/obj/utils/cameras/ControlsController';
export declare abstract class TypedViewer<C extends BaseCameraObjNodeType> {
    protected _container: HTMLElement;
    protected _scene: PolyScene;
    protected _camera_node: C;
    protected _canvas: HTMLCanvasElement | undefined;
    protected _active: boolean;
    private static _next_viewer_id;
    private _id;
    get active(): boolean;
    activate(): void;
    deactivate(): void;
    protected _cameras_controller: ViewerCamerasController | undefined;
    get cameras_controller(): ViewerCamerasController;
    protected _controls_controller: ViewerControlsController | undefined;
    get controls_controller(): ViewerControlsController | undefined;
    protected _events_controller: ViewerEventsController | undefined;
    get events_controller(): ViewerEventsController;
    protected _webgl_controller: WebGLController | undefined;
    get webgl_controller(): WebGLController;
    constructor(_container: HTMLElement, _scene: PolyScene, _camera_node: C);
    get container(): HTMLElement;
    get scene(): PolyScene;
    get canvas(): HTMLCanvasElement | undefined;
    get camera_node(): C;
    get camera_controls_controller(): ThreejsCameraControlsController | undefined;
    get id(): number;
    dispose(): void;
    reset_container_class(): void;
    set_container_class_hovered(): void;
}
export declare type BaseViewerType = TypedViewer<BaseCameraObjNodeType>;
import { BaseViewerType } from '../_Base';
declare type MouseOrTouchEventCallback = (e: MouseEvent) => void;
export declare class ViewerEventsController {
    protected viewer: BaseViewerType;
    protected _bound_on_mousedown: MouseOrTouchEventCallback;
    protected _bound_on_mousemove: MouseOrTouchEventCallback;
    protected _bound_on_mouseup: MouseOrTouchEventCallback;
    constructor(viewer: BaseViewerType);
    get camera_node(): import("../../nodes/obj/_BaseCamera").BaseCameraObjNodeType;
    get canvas(): HTMLCanvasElement | undefined;
    init(): void;
    private process_event;
}
export {};

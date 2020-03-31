import { BaseViewer } from '../_Base';
declare type MouseOrTouchEvent = MouseEvent | TouchEvent;
declare type MouseOrTouchEventCallback = (e: MouseOrTouchEvent) => void;
export declare class EventsController {
    protected viewer: BaseViewer;
    protected _bound_on_mousedown: MouseOrTouchEventCallback;
    protected _bound_on_mousemove: MouseOrTouchEventCallback;
    protected _bound_on_mouseup: MouseOrTouchEventCallback;
    constructor(viewer: BaseViewer);
    get camera_node(): import("../../nodes/obj/_BaseCamera").BaseCameraObjNodeType | null;
    get canvas(): HTMLCanvasElement | undefined;
    init(): void;
    protected _on_mousedown(event: MouseOrTouchEvent): void;
    protected _on_mousemove(event: MouseOrTouchEvent): void;
    protected _on_mouseup(event: MouseOrTouchEvent): void;
}
export {};

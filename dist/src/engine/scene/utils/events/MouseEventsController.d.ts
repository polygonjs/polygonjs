import { BaseSceneEventsController } from './_BaseEventsController';
import { MouseEventNode } from '../../../nodes/event/Mouse';
declare enum MouseEventType {
    auxclick = "auxclick",
    click = "click",
    contextmenu = "contextmenu",
    dblclick = "dblclick",
    mousedown = "mousedown",
    mouseenter = "mouseenter",
    mouseleave = "mouseleave",
    mousemove = "mousemove",
    mouseover = "mouseover",
    mouseout = "mouseout",
    mouseup = "mouseup",
    pointerlockchange = "pointerlockchange",
    pointerlockerror = "pointerlockerror",
    select = "select",
    wheel = "wheel"
}
export declare const ACCEPTED_MOUSE_EVENT_TYPES: MouseEventType[];
export declare class MouseEventsController extends BaseSceneEventsController<MouseEvent, MouseEventNode> {
    protected _require_canvas_event_listeners: boolean;
    type(): string;
    accepted_event_types(): string[];
}
export {};

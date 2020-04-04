import { BaseEventsController } from './_BaseEventsController';
import { MouseEventNode } from '../../../nodes/event/MouseEvent';
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
export declare class MouseEventsController extends BaseEventsController<MouseEvent, MouseEventNode> {
    accepts_event(event: MouseEvent): boolean;
}
export {};

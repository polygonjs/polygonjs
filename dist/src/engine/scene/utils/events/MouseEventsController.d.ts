import { BaseEventsController } from './_BaseEventsController';
import { MouseEventNode } from '../../../nodes/event/MouseEvent';
declare enum MouseEventType {
    DOWN = "mousedown",
    MOVE = "mousemove",
    UP = "mouseup",
    ENTER = "mouseenter",
    LEAVE = "mouseleave"
}
export declare const ACCEPTED_MOUSE_EVENT_TYPES: MouseEventType[];
export declare class MouseEventsController extends BaseEventsController<MouseEvent, MouseEventNode> {
    accepts_event(event: MouseEvent): boolean;
}
export {};

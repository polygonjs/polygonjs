import { BaseSceneEventsController } from './_BaseEventsController';
import { PointerEventNode } from '../../../nodes/event/Pointer';
declare enum PointerEventType {
    pointerdown = "pointerdown",
    pointermove = "pointermove",
    pointerup = "pointerup"
}
export declare const ACCEPTED_POINTER_EVENT_TYPES: PointerEventType[];
export declare class PointerEventsController extends BaseSceneEventsController<MouseEvent, PointerEventNode> {
    protected _require_canvas_event_listeners: boolean;
    type(): string;
    accepted_event_types(): string[];
}
export {};

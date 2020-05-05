import { BaseSceneEventsController } from './_BaseEventsController';
import { KeyboardEventNode } from '../../../nodes/event/Keyboard';
declare enum KeyboardEventType {
    keydown = "keydown",
    keypress = "keypress",
    keyup = "keyup"
}
export declare const ACCEPTED_KEYBOARD_EVENT_TYPES: KeyboardEventType[];
export declare class KeyboardEventsController extends BaseSceneEventsController<KeyboardEvent, KeyboardEventNode> {
    protected _require_canvas_event_listeners: boolean;
    type(): string;
    accepted_event_types(): string[];
}
export {};

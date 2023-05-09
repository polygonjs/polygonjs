import {CoreEventEmitter} from './CoreEventEmitter';
import {PointerEventType} from './PointerEventType';
import {KeyboardEventType} from './KeyboardEventType';
import {WindowEventType} from './WindowEventType';
import {DragEventType} from './DragEventType';
import {MouseEventType} from './MouseEventType';
import {TouchEventType} from './TouchEventType';

export type EventType =
	| PointerEventType
	| MouseEventType
	| KeyboardEventType
	| WindowEventType
	| DragEventType
	| KeyboardEventType
	| TouchEventType;
export interface EventData {
	type: EventType;
	emitter: CoreEventEmitter;
}

/**
 * sends a trigger when a keyboard key is pressed down
 *
 *
 */

import {JsType} from '../../poly/registers/nodes/types/Js';
import {KeyboardEventType} from '../../../core/event/KeyboardEventType';
import {BaseOnKeyEventJsNode} from './_BaseOnKeyEvent';

export class OnKeydownJsNode extends BaseOnKeyEventJsNode {
	static override type() {
		return JsType.ON_KEYDOWN;
	}
	userInputEventNames() {
		return [KeyboardEventType.keydown];
	}
}

/**
 * sends a trigger when a keyboard key is pressed
 *
 *
 */

import {JsType} from '../../poly/registers/nodes/types/Js';
import {KeyboardEventType} from '../../../core/event/KeyboardEventType';
import {BaseOnKeyEventJsNode} from './_BaseOnKeyEvent';

export class OnKeypressJsNode extends BaseOnKeyEventJsNode {
	static override type() {
		return JsType.ON_KEYPRESS;
	}
	userInputEventNames() {
		return [KeyboardEventType.keypress];
	}
}

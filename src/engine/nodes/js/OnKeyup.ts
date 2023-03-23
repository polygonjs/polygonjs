/**
 * sends a trigger when a keyboard key is release
 *
 *
 */

import {JsType} from '../../poly/registers/nodes/types/Js';
import {KeyboardEventType} from '../../../core/event/KeyboardEventType';
import {BaseOnKeyEventJsNode} from './_BaseOnKeyEvent';

export class OnKeyupJsNode extends BaseOnKeyEventJsNode {
	static override type() {
		return JsType.ON_KEYUP;
	}
	userInputEventNames() {
		return [KeyboardEventType.keyup];
	}
}

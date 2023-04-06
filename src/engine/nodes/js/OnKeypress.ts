/**
 * sends a trigger when a keyboard key is pressed
 *
 *
 */

import {JsType} from '../../poly/registers/nodes/types/Js';
import {KeyboardEventType} from '../../../core/event/KeyboardEventType';
import {BaseOnKeyEventJsNode} from './_BaseOnKeyEvent';
import {EvaluatorEventData} from './code/assemblers/actor/Evaluator';

export class OnKeypressJsNode extends BaseOnKeyEventJsNode {
	static override type() {
		return JsType.ON_KEYPRESS;
	}
	override eventData(): EvaluatorEventData | undefined {
		return {
			type: KeyboardEventType.keypress,
			emitter: this.eventEmitter(),
			jsType: JsType.ON_KEYPRESS,
		};
	}
}

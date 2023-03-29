/**
 * sends a trigger when a keyboard key is pressed down
 *
 *
 */

import {JsType} from '../../poly/registers/nodes/types/Js';
import {BaseOnKeyEventJsNode} from './_BaseOnKeyEvent';
import {EvaluatorEventData} from './code/assemblers/actor/Evaluator';

export class OnKeydownJsNode extends BaseOnKeyEventJsNode {
	static override type() {
		return JsType.ON_KEYDOWN;
	}
	// userInputEventNames() {
	// 	return [KeyboardEventType.keydown];
	// }
	override eventData(): EvaluatorEventData | undefined {
		return {
			type: 'keydown',
			emitter: this.eventEmitter(),
			jsType: JsType.ON_KEYDOWN,
		};
	}
}

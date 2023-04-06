/**
 * sends a trigger when a keyboard key is released
 *
 *
 */

import {JsType} from '../../poly/registers/nodes/types/Js';
import {EvaluatorEventData} from './code/assemblers/actor/Evaluator';
import {KeyboardEventType} from '../../../core/event/KeyboardEventType';
import {BaseOnKeyEventJsNode} from './_BaseOnKeyEvent';

export class OnKeyupJsNode extends BaseOnKeyEventJsNode {
	static override type() {
		return JsType.ON_KEYUP;
	}
	override eventData(): EvaluatorEventData | undefined {
		return {
			type: KeyboardEventType.keyup,
			emitter: this.eventEmitter(),
			jsType: JsType.ON_KEYUP,
		};
	}
}

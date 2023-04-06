/**
 * sends a trigger when a keyboard key is pressed or released
 *
 *
 */

import {JsType} from '../../poly/registers/nodes/types/Js';
import {EvaluatorEventData} from './code/assemblers/actor/Evaluator';
import {KeyboardEventType} from '../../../core/event/KeyboardEventType';
import {BaseOnKeyEventJsNode} from './_BaseOnKeyEvent';

export class OnKeyJsNode extends BaseOnKeyEventJsNode {
	static override type() {
		return JsType.ON_KEY;
	}
	override eventData(): EvaluatorEventData[] | undefined {
		return [
			{
				type: KeyboardEventType.keydown,
				emitter: this.eventEmitter(),
				jsType: JsType.ON_KEY,
			},
			{
				type: KeyboardEventType.keyup,
				emitter: this.eventEmitter(),
				jsType: JsType.ON_KEY,
			},
		];
	}
}

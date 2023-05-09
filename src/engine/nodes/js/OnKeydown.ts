/**
 * sends a trigger when a keyboard key is pressed down
 *
 *
 */

import {JsType} from '../../poly/registers/nodes/types/Js';
import {BaseOnKeyEventJsNode} from './_BaseOnKeyEvent';
import {EvaluatorEventData} from './code/assemblers/actor/ActorEvaluator';
import {KeyboardEventType} from '../../../core/event/KeyboardEventType';

export class OnKeydownJsNode extends BaseOnKeyEventJsNode {
	static override type() {
		return JsType.ON_KEYDOWN;
	}
	override eventData(): EvaluatorEventData | undefined {
		return {
			type: KeyboardEventType.keydown,
			emitter: this.eventEmitter(),
			jsType: JsType.ON_KEYDOWN,
		};
	}
}

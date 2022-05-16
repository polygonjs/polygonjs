/**
 * sends a trigger when a keyboard key is release
 *
 *
 */

import {ActorType} from '../../poly/registers/nodes/types/Actor';
import {KeyboardEventType} from '../../../core/event/KeyboardEventType';
import {BaseOnKeyEventActorNode} from './_BaseOnKeyEvent';

export class OnKeyupActorActorNode extends BaseOnKeyEventActorNode {
	static override type() {
		return ActorType.ON_KEYUP;
	}
	userInputEventNames() {
		return [KeyboardEventType.keyup];
	}
}

/**
 * sends a trigger when a keyboard key is pressed down
 *
 *
 */

import {ActorType} from '../../poly/registers/nodes/types/Actor';
import {KeyboardEventType} from '../../../core/event/KeyboardEventType';
import {BaseOnKeyEventActorNode} from './_BaseOnKeyEvent';

export class OnKeydownActorActorNode extends BaseOnKeyEventActorNode {
	static override type() {
		return ActorType.ON_KEYDOWN;
	}
	userInputEventNames() {
		return [KeyboardEventType.keydown];
	}
}

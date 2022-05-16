/**
 * sends a trigger when a keyboard key is pressed
 *
 *
 */

import {ActorType} from '../../poly/registers/nodes/types/Actor';
import {KeyboardEventType} from '../../../core/event/KeyboardEventType';
import {BaseOnKeyEventActorNode} from './_BaseOnKeyEvent';

export class OnKeypressActorActorNode extends BaseOnKeyEventActorNode {
	static override type() {
		return ActorType.ON_KEYPRESS;
	}
	userInputEventNames() {
		return [KeyboardEventType.keypress];
	}
}

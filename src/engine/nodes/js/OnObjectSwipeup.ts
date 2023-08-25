/**
 * sends a trigger when the viewer swipes up on an object
 *
 *
 */

import {JsType} from '../../poly/registers/nodes/types/Js';
import {BaseOnObjectSwipeEventJsNode} from './_BaseOnObjectSwipeEvent';

export class OnObjectSwipeupJsNode extends BaseOnObjectSwipeEventJsNode {
	static override type() {
		return JsType.ON_OBJECT_SWIPEUP;
	}
	protected _cursorComparison(onPointerdownCursor: string, onPointerupCursor: string): string {
		return `${onPointerdownCursor}.y < ${onPointerupCursor}.y`;
	}
}

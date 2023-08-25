/**
 * sends a trigger when the viewer swipes down on an object
 *
 *
 */

import {JsType} from '../../poly/registers/nodes/types/Js';
import {BaseOnObjectSwipeEventJsNode} from './_BaseOnObjectSwipeEvent';

export class OnObjectSwipedownJsNode extends BaseOnObjectSwipeEventJsNode {
	static override type() {
		return JsType.ON_OBJECT_SWIPEDOWN;
	}
	protected _cursorComparison(onPointerdownCursor: string, onPointerupCursor: string): string {
		return `${onPointerdownCursor}.y > ${onPointerupCursor}.y`;
	}
}

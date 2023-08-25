/**
 * sends a trigger when the viewer swipes right on an object
 *
 *
 */

import {JsType} from '../../poly/registers/nodes/types/Js';
import {BaseOnObjectSwipeEventJsNode} from './_BaseOnObjectSwipeEvent';

export class OnObjectSwiperightJsNode extends BaseOnObjectSwipeEventJsNode {
	static override type() {
		return JsType.ON_OBJECT_SWIPERIGHT;
	}
	protected _cursorComparison(onPointerdownCursor: string, onPointerupCursor: string): string {
		return `${onPointerdownCursor}.x < ${onPointerupCursor}.x`;
	}
}

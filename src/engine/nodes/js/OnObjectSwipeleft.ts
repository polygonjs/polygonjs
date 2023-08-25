/**
 * sends a trigger when the viewer swipes left on an object
 *
 *
 */

import {JsType} from '../../poly/registers/nodes/types/Js';
import {BaseOnObjectSwipeEventJsNode} from './_BaseOnObjectSwipeEvent';

export class OnObjectSwipeleftJsNode extends BaseOnObjectSwipeEventJsNode {
	static override type() {
		return JsType.ON_OBJECT_SWIPELEFT;
	}
	protected _cursorComparison(onPointerdownCursor: string, onPointerupCursor: string): string {
		return `${onPointerdownCursor}.x > ${onPointerupCursor}.x`;
	}
}

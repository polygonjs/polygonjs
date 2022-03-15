import {Vector2} from 'three/src/math/Vector2';
// import {CoreVector} from '../../../../../core/Vector';
// import {EventContext} from '../../../../scene/utils/events/_BaseEventsController';
import {CursorHelper} from '../CursorHelper';

export class BaseRaycastController {
	// private _offset: CursorOffset = {offsetX: 0, offsetY: 0};
	protected _cursorHelper: CursorHelper = new CursorHelper();
	protected _cursor: Vector2 = new Vector2();

	// protected _setCursor(eventContext: EventContext<MouseEvent | DragEvent | PointerEvent | TouchEvent>) {
	// 	this._cursorHelper.setCursor(eventContext, this._cursor);
	// 	if (CoreVector.isVector2Valid(this._cursor)) {
	// 		this._remapCursor();
	// 	}
	// }

	// protected _remapCursor() {}
}

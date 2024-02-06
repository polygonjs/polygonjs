import {Vector2} from 'three';
import {CursorHelper} from '../../../../../core/event/CursorHelper';

export class BaseRaycastController {
	protected _cursorHelper: CursorHelper = new CursorHelper();
	protected _cursor: Vector2 = new Vector2();
}

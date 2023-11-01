import {Ref} from '@vue/reactivity';
import {Vector2} from 'three';

const _lastCursorPos = new Vector2();
const _currentCursorPos = new Vector2();
const _cursorDelta = new Vector2();

export class CursorMoveMonitor {
	private _lastCursorPosSet: boolean = false;
	private _movedCursorDistance: number = 0;
	private cursorRef: Ref<Vector2> | undefined;
	constructor() {}
	private _bound = {
		pointermove: this._onPointermove.bind(this),
	};
	addPointermoveEventListener(cursorRef: Ref<Vector2>) {
		this.cursorRef = cursorRef;
		this._movedCursorDistance = 0;
		this._lastCursorPosSet = false;
		document.addEventListener('pointermove', this._bound.pointermove);
		document.addEventListener('touchmove', this._bound.pointermove);
	}
	removeEventListener() {
		document.removeEventListener('pointermove', this._bound.pointermove);
		document.removeEventListener('touchmove', this._bound.pointermove);
	}
	movedCursorDistance() {
		return this._movedCursorDistance;
	}
	private _onPointermove() {
		if (!this.cursorRef) {
			return;
		}
		const cursor = this.cursorRef.value;
		if (this._lastCursorPosSet == false) {
			_lastCursorPos.copy(cursor);
			this._lastCursorPosSet = true;
		}
		_currentCursorPos.copy(cursor);
		_cursorDelta.copy(_currentCursorPos).sub(_lastCursorPos);
		// we divide by 2 because the cursor is in the [-1,1] range
		// and covering the whole screen would give a length of 2.
		// But it's easier to think in term of [0,1] range
		this._movedCursorDistance += _cursorDelta.manhattanLength() / 2;
		_lastCursorPos.copy(_currentCursorPos);
	}
}

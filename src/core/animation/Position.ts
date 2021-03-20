import {TypeAssert} from '../../engine/poly/Assert';

export enum AnimationPositionMode {
	RELATIVE = 'relative',
	ABSOLUTE = 'absolute',
}
export const ANIMATION_POSITION_MODES = [AnimationPositionMode.RELATIVE, AnimationPositionMode.ABSOLUTE];
export enum AnimationPositionRelativeTo {
	START = 'start',
	END = 'end',
}
export const ANIMATION_POSITION_RELATIVE_TOS: AnimationPositionRelativeTo[] = [
	AnimationPositionRelativeTo.START,
	AnimationPositionRelativeTo.END,
];

// https://greensock.com/position-parameter/
// https://greensock.com/docs/v3/GSAP/Timeline
export class AnimationPosition {
	private _mode = AnimationPositionMode.RELATIVE;
	private _relativeTo: AnimationPositionRelativeTo = AnimationPositionRelativeTo.END;
	private _offset: number = 0;

	clone() {
		const new_position = new AnimationPosition();
		new_position.setMode(this._mode);
		new_position.setRelativeTo(this._relativeTo);
		new_position.setOffset(this._offset);
		return new_position;
	}

	setMode(mode: AnimationPositionMode) {
		this._mode = mode;
	}
	mode() {
		return this._mode;
	}
	setRelativeTo(relative_to: AnimationPositionRelativeTo) {
		this._relativeTo = relative_to;
	}
	relativeTo() {
		return this._relativeTo;
	}
	setOffset(offset: number) {
		this._offset = offset;
	}
	offset() {
		return this._offset;
	}

	toParameter() {
		switch (this._mode) {
			case AnimationPositionMode.RELATIVE:
				return this._relative_position_param();
			case AnimationPositionMode.ABSOLUTE:
				return this._absolutePositionParam();
		}
		TypeAssert.unreachable(this._mode);
	}
	private _relative_position_param() {
		switch (this._relativeTo) {
			case AnimationPositionRelativeTo.END:
				return this._offsetString();
			case AnimationPositionRelativeTo.START:
				return `<${this._offset}`;
		}
		TypeAssert.unreachable(this._relativeTo);
	}
	private _absolutePositionParam() {
		return this._offset;
	}
	private _offsetString() {
		if (this._offset > 0) {
			return `+=${this._offset}`;
		} else {
			return `-=${Math.abs(this._offset)}`;
		}
	}
}

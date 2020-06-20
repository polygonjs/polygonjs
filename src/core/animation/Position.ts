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
	private _relative_to: AnimationPositionRelativeTo = AnimationPositionRelativeTo.END;
	private _offset: number = 0;

	clone() {
		const new_position = new AnimationPosition();
		new_position.set_mode(this._mode);
		new_position.set_relative_to(this._relative_to);
		new_position.set_offset(this._offset);
		return new_position;
	}

	set_mode(mode: AnimationPositionMode) {
		this._mode = mode;
	}
	mode() {
		return this._mode;
	}
	set_relative_to(relative_to: AnimationPositionRelativeTo) {
		this._relative_to = relative_to;
	}
	relative_to() {
		return this._relative_to;
	}
	set_offset(offset: number) {
		this._offset = offset;
	}
	offset() {
		return this._offset;
	}

	to_parameter() {
		switch (this._mode) {
			case AnimationPositionMode.RELATIVE:
				return this._relative_position_param();
			case AnimationPositionMode.ABSOLUTE:
				return this._absolute_position_param();
		}
		TypeAssert.unreachable(this._mode);
	}
	private _relative_position_param() {
		switch (this._relative_to) {
			case AnimationPositionRelativeTo.END:
				return this._offset_string();
			case AnimationPositionRelativeTo.START:
				return `<${this._offset}`;
		}
	}
	private _absolute_position_param() {
		return this._offset;
	}
	private _offset_string() {
		if (this._offset > 0) {
			return `+=${this._offset}`;
		} else {
			return `-=${Math.abs(this._offset)}`;
		}
	}
}

import {TypeAssert} from "../../engine/poly/Assert";
export var AnimationPositionMode;
(function(AnimationPositionMode2) {
  AnimationPositionMode2["RELATIVE"] = "relative";
  AnimationPositionMode2["ABSOLUTE"] = "absolute";
})(AnimationPositionMode || (AnimationPositionMode = {}));
export const ANIMATION_POSITION_MODES = [AnimationPositionMode.RELATIVE, AnimationPositionMode.ABSOLUTE];
export var AnimationPositionRelativeTo;
(function(AnimationPositionRelativeTo2) {
  AnimationPositionRelativeTo2["START"] = "start";
  AnimationPositionRelativeTo2["END"] = "end";
})(AnimationPositionRelativeTo || (AnimationPositionRelativeTo = {}));
export const ANIMATION_POSITION_RELATIVE_TOS = [
  AnimationPositionRelativeTo.START,
  AnimationPositionRelativeTo.END
];
export class AnimationPosition {
  constructor() {
    this._mode = AnimationPositionMode.RELATIVE;
    this._relative_to = AnimationPositionRelativeTo.END;
    this._offset = 0;
  }
  clone() {
    const new_position = new AnimationPosition();
    new_position.set_mode(this._mode);
    new_position.set_relative_to(this._relative_to);
    new_position.set_offset(this._offset);
    return new_position;
  }
  set_mode(mode) {
    this._mode = mode;
  }
  mode() {
    return this._mode;
  }
  set_relative_to(relative_to) {
    this._relative_to = relative_to;
  }
  relative_to() {
    return this._relative_to;
  }
  set_offset(offset) {
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
  _relative_position_param() {
    switch (this._relative_to) {
      case AnimationPositionRelativeTo.END:
        return this._offset_string();
      case AnimationPositionRelativeTo.START:
        return `<${this._offset}`;
    }
  }
  _absolute_position_param() {
    return this._offset;
  }
  _offset_string() {
    if (this._offset > 0) {
      return `+=${this._offset}`;
    } else {
      return `-=${Math.abs(this._offset)}`;
    }
  }
}

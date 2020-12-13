export declare enum AnimationPositionMode {
    RELATIVE = "relative",
    ABSOLUTE = "absolute"
}
export declare const ANIMATION_POSITION_MODES: AnimationPositionMode[];
export declare enum AnimationPositionRelativeTo {
    START = "start",
    END = "end"
}
export declare const ANIMATION_POSITION_RELATIVE_TOS: AnimationPositionRelativeTo[];
export declare class AnimationPosition {
    private _mode;
    private _relative_to;
    private _offset;
    clone(): AnimationPosition;
    set_mode(mode: AnimationPositionMode): void;
    mode(): AnimationPositionMode;
    set_relative_to(relative_to: AnimationPositionRelativeTo): void;
    relative_to(): AnimationPositionRelativeTo;
    set_offset(offset: number): void;
    offset(): number;
    to_parameter(): StringOrNumber;
    private _relative_position_param;
    private _absolute_position_param;
    private _offset_string;
}

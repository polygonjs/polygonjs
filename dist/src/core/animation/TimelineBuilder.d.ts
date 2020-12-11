import { AnimPropertyTargetValue } from './TimelineBuilderProperty';
import { PolyScene } from '../../engine/scene/PolyScene';
import { PropertyTarget } from './PropertyTarget';
import { AnimationPosition } from './Position';
import { AnimationUpdateCallback } from './UpdateCallback';
export declare enum Operation {
    SET = "set",
    ADD = "add",
    SUBSTRACT = "substract"
}
export declare const OPERATIONS: Operation[];
export interface AnimationRepeatParams {
    count: number;
    delay: number;
    yoyo: boolean;
}
export declare class TimelineBuilder {
    private _timeline_builders;
    private _parent;
    private _target;
    private _duration;
    private _easing;
    private _operation;
    private _repeat_params;
    private _delay;
    private _position;
    private _property;
    private _update_callback;
    add_timeline_builder(timeline_builder: TimelineBuilder): void;
    timeline_builders(): TimelineBuilder[];
    set_parent(parent: TimelineBuilder): void;
    parent(): TimelineBuilder | undefined;
    set_target(target: PropertyTarget): void;
    target(): PropertyTarget | undefined;
    set_duration(duration: number): void;
    duration(): number;
    set_easing(easing: string): void;
    easing(): string | undefined;
    set_operation(operation: Operation): void;
    operation(): Operation;
    set_repeat_params(repeat_params: AnimationRepeatParams): void;
    repeat_params(): AnimationRepeatParams | undefined;
    set_delay(delay: number): void;
    delay(): number;
    set_position(position: AnimationPosition | undefined): void;
    position(): AnimationPosition | undefined;
    set_update_callback(update_callback: AnimationUpdateCallback): void;
    update_callback(): AnimationUpdateCallback | undefined;
    clone(): TimelineBuilder;
    set_property_name(name: string): void;
    set_property_value(value: AnimPropertyTargetValue): void;
    populate(timeline: gsap.core.Timeline, scene: PolyScene): void;
}

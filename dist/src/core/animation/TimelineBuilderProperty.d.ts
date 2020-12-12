import { Vector2 } from 'three/src/math/Vector2';
import { Vector3 } from 'three/src/math/Vector3';
import { Vector4 } from 'three/src/math/Vector4';
import { TimelineBuilder } from './TimelineBuilder';
import { PropertyTarget } from './PropertyTarget';
import { PolyScene } from '../../engine/scene/PolyScene';
export declare type AnimPropertyTargetValue = number | Vector2 | Vector3 | Vector4;
export declare class TimelineBuilderProperty {
    private _property_name;
    private _target_value;
    constructor();
    set_name(name: string): void;
    set_target_value(value: AnimPropertyTargetValue): void;
    name(): string | undefined;
    target_value(): number | Vector3 | Vector2 | Vector4 | undefined;
    clone(): TimelineBuilderProperty;
    add_to_timeline(timeline_builder: TimelineBuilder, scene: PolyScene, timeline: gsap.core.Timeline, target: PropertyTarget): void;
    private _populate_with_objects;
    private _scene_graph_props;
    private _populate_with_node;
    private _populate_vars_for_param;
    private _populate_vars_for_param_float;
    private _populate_vars_for_param_vector2;
    private _populate_vars_for_param_vector3;
    private _populate_vars_for_param_vector4;
    private with_op;
    private _common_vars;
    private _start_timeline;
}

import {TimelineBuilderProperty, AnimPropertyTargetValue} from './TimelineBuilderProperty';
import {PolyScene} from '../../engine/scene/PolyScene';
import {PropertyTarget} from './PropertyTarget';
import {AnimationPosition} from './Position';
import {AnimationUpdateCallback} from './UpdateCallback';
import gsap from 'gsap';

export enum Operation {
	SET = 'set',
	ADD = 'add',
	SUBSTRACT = 'substract',
}
export const OPERATIONS: Operation[] = [Operation.SET, Operation.ADD, Operation.SUBSTRACT];

export interface AnimationRepeatParams {
	count: number;
	delay: number;
	yoyo: boolean;
}

export class TimelineBuilder {
	private _timeline_builders: TimelineBuilder[] = [];
	private _parent: TimelineBuilder | undefined;
	private _target: PropertyTarget | undefined;
	private _duration: number = 1;
	private _easing: string | undefined;
	private _operation: Operation = Operation.SET;
	private _repeat_params: AnimationRepeatParams | undefined;
	private _delay: number = 0;
	private _position: AnimationPosition | undefined;
	private _property: TimelineBuilderProperty | undefined;
	private _update_callback: AnimationUpdateCallback | undefined;

	add_timeline_builder(timeline_builder: TimelineBuilder) {
		this._timeline_builders.push(timeline_builder);
		timeline_builder.set_parent(this);
	}
	timeline_builders() {
		return this._timeline_builders;
	}
	set_parent(parent: TimelineBuilder) {
		this._parent = parent;
	}
	parent() {
		return this._parent;
	}

	set_target(target: PropertyTarget) {
		this._target = target;
		for (let builder of this._timeline_builders) {
			builder.set_target(target);
		}
	}
	target() {
		return this._target;
	}
	set_duration(duration: number) {
		if (duration >= 0) {
			this._duration = duration;
			for (let builder of this._timeline_builders) {
				builder.set_duration(duration);
			}
		}
	}
	duration() {
		return this._duration;
	}
	set_easing(easing: string) {
		this._easing = easing;
		for (let builder of this._timeline_builders) {
			builder.set_easing(easing);
		}
	}
	easing() {
		return this._easing;
	}
	set_operation(operation: Operation) {
		this._operation = operation;
		for (let builder of this._timeline_builders) {
			builder.set_operation(operation);
		}
	}
	operation() {
		return this._operation;
	}
	set_repeat_params(repeat_params: AnimationRepeatParams) {
		this._repeat_params = repeat_params;
		for (let builder of this._timeline_builders) {
			builder.set_repeat_params(repeat_params);
		}
	}
	repeat_params() {
		return this._repeat_params;
	}
	set_delay(delay: number) {
		this._delay = delay;
		for (let builder of this._timeline_builders) {
			builder.set_delay(delay);
		}
	}
	delay() {
		return this._delay;
	}
	setPosition(position: AnimationPosition | undefined) {
		this._position = position;
		// That should not be recursive here,
		// otherwise the merge node will override timelines whose position may already been set
		// for (let builder of this._timeline_builders) {
		// 	builder.setPosition(position);
		// }
	}
	position() {
		return this._position;
	}
	set_update_callback(update_callback: AnimationUpdateCallback) {
		this._update_callback = update_callback;
	}
	update_callback() {
		return this._update_callback;
	}
	// merge(timeline_builder?: TimelineBuilder) {
	// 	if (!timeline_builder) {
	// 		return;
	// 	}
	// }
	clone() {
		const new_timeline_builder = new TimelineBuilder();
		new_timeline_builder.set_duration(this._duration);
		new_timeline_builder.set_operation(this._operation);
		new_timeline_builder.set_delay(this._delay);

		if (this._target) {
			new_timeline_builder.set_target(this._target.clone());
		}
		if (this._easing) {
			new_timeline_builder.set_easing(this._easing);
		}
		if (this._delay) {
			new_timeline_builder.set_delay(this._delay);
		}
		if (this._update_callback) {
			new_timeline_builder.set_update_callback(this._update_callback.clone());
		}
		if (this._repeat_params) {
			new_timeline_builder.set_repeat_params({
				count: this._repeat_params.count,
				delay: this._repeat_params.delay,
				yoyo: this._repeat_params.yoyo,
			});
		}
		if (this._property) {
			const name = this._property.name();
			if (name) {
				new_timeline_builder.setPropertyName(name);
			}
			const target_value = this._property.target_value();
			if (target_value != null) {
				new_timeline_builder.setPropertyValue(target_value);
			}
		}
		if (this._position) {
			new_timeline_builder.setPosition(this._position.clone());
		}
		for (let child_timeline_builder of this._timeline_builders) {
			const new_child_timeline_builder = child_timeline_builder.clone();
			new_timeline_builder.add_timeline_builder(new_child_timeline_builder);
		}
		return new_timeline_builder;
	}

	setPropertyName(name: string) {
		this.property().setName(name);
	}
	property() {
		return (this._property = this._property || new TimelineBuilderProperty());
	}
	propertyName() {
		return this.property().name();
	}
	setPropertyValue(value: AnimPropertyTargetValue) {
		this.property().set_target_value(value);
	}

	populate(timeline: gsap.core.Timeline, scene: PolyScene) {
		for (let timeline_builder of this._timeline_builders) {
			const sub_timeline = gsap.timeline();
			timeline_builder.populate(sub_timeline, scene);

			const position_param = timeline_builder.position()?.to_parameter() || undefined;
			timeline.add(sub_timeline, position_param);
		}

		if (this._property && this._target) {
			this._property.add_to_timeline(this, scene, timeline, this._target);
		}
	}
}

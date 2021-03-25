import {TimelineBuilderProperty, AnimPropertyTargetValue} from './TimelineBuilderProperty';
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

	private _debug = false;
	setDebug(debug: boolean) {
		this._debug = true;
	}
	private _printDebug(message: any) {
		if (!this._debug) {
			return;
		}
		console.log(message);
	}

	addTimelineBuilder(timeline_builder: TimelineBuilder) {
		this._timeline_builders.push(timeline_builder);
		timeline_builder.setParent(this);
	}
	timelineBuilders() {
		return this._timeline_builders;
	}
	setParent(parent: TimelineBuilder) {
		this._parent = parent;
	}
	parent() {
		return this._parent;
	}

	setTarget(target: PropertyTarget) {
		this._target = target;
		for (let builder of this._timeline_builders) {
			builder.setTarget(target);
		}
	}
	target() {
		return this._target;
	}
	setDuration(duration: number) {
		if (duration >= 0) {
			this._duration = duration;
			for (let builder of this._timeline_builders) {
				builder.setDuration(duration);
			}
		}
	}
	duration() {
		return this._duration;
	}
	setEasing(easing: string) {
		this._easing = easing;
		for (let builder of this._timeline_builders) {
			builder.setEasing(easing);
		}
	}
	easing() {
		return this._easing;
	}
	setOperation(operation: Operation) {
		this._operation = operation;
		for (let builder of this._timeline_builders) {
			builder.setOperation(operation);
		}
	}
	operation() {
		return this._operation;
	}
	setRepeatParams(repeat_params: AnimationRepeatParams) {
		this._repeat_params = repeat_params;
		for (let builder of this._timeline_builders) {
			builder.setRepeatParams(repeat_params);
		}
	}
	repeatParams() {
		return this._repeat_params;
	}
	setDelay(delay: number) {
		this._delay = delay;
		for (let builder of this._timeline_builders) {
			builder.setDelay(delay);
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
	setUpdateCallback(update_callback: AnimationUpdateCallback) {
		this._update_callback = update_callback;
	}
	updateCallback() {
		return this._update_callback;
	}
	// merge(timeline_builder?: TimelineBuilder) {
	// 	if (!timeline_builder) {
	// 		return;
	// 	}
	// }
	clone() {
		const new_timeline_builder = new TimelineBuilder();
		new_timeline_builder.setDuration(this._duration);
		new_timeline_builder.setOperation(this._operation);
		new_timeline_builder.setDelay(this._delay);

		if (this._target) {
			new_timeline_builder.setTarget(this._target.clone());
		}
		if (this._easing) {
			new_timeline_builder.setEasing(this._easing);
		}
		if (this._delay) {
			new_timeline_builder.setDelay(this._delay);
		}
		if (this._update_callback) {
			new_timeline_builder.setUpdateCallback(this._update_callback.clone());
		}
		if (this._repeat_params) {
			new_timeline_builder.setRepeatParams({
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
			const target_value = this._property.targetValue();
			if (target_value != null) {
				new_timeline_builder.setPropertyValue(target_value);
			}
		}
		if (this._position) {
			new_timeline_builder.setPosition(this._position.clone());
		}
		for (let child_timeline_builder of this._timeline_builders) {
			const new_child_timeline_builder = child_timeline_builder.clone();
			new_timeline_builder.addTimelineBuilder(new_child_timeline_builder);
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
		this.property().setTargetValue(value);
	}

	populate(timeline: gsap.core.Timeline) {
		this._printDebug(['populate', this, timeline]);
		for (let timeline_builder of this._timeline_builders) {
			const sub_timeline = gsap.timeline();
			timeline_builder.setDebug(this._debug);
			timeline_builder.populate(sub_timeline);

			const position_param = timeline_builder.position()?.toParameter() || undefined;
			timeline.add(sub_timeline, position_param);
		}

		if (this._property && this._target) {
			this._property.setDebug(this._debug);
			this._property.addToTimeline(this, timeline, this._target);
		}
	}
}

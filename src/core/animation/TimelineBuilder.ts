import {TimelineBuilderProperty, AnimPropertyTargetValue, RegisterOptions} from './TimelineBuilderProperty';
import {PropertyTarget} from './PropertyTarget';
import {AnimationPosition} from './Position';
import {AnimationUpdateCallback} from './UpdateCallback';
import gsap from 'gsap';

export enum Operation {
	SET = 'set',
	ADD = 'add',
	SUBTRACT = 'subtract',
}
export const OPERATIONS: Operation[] = [Operation.SET, Operation.ADD, Operation.SUBTRACT];

export interface AnimationRepeatParams {
	count: number;
	delay: number;
	yoyo: boolean;
}

export class TimelineBuilder {
	private _timelineBuilders: TimelineBuilder[] = [];
	private _parent: TimelineBuilder | undefined;
	private _target: PropertyTarget | undefined;
	private _duration: number = 1;
	private _easing: string | undefined;
	private _operation: Operation = Operation.SET;
	private _repeatParams: AnimationRepeatParams | undefined;
	private _delay: number = 0;
	private _position: AnimationPosition | undefined;
	private _property: TimelineBuilderProperty | undefined;
	private _updateCallback: AnimationUpdateCallback | undefined;
	private _stoppable = true;

	private _debug = false;
	setDebug(debug: boolean) {
		this._debug = debug;
	}
	private _printDebug(message: any) {
		if (!this._debug) {
			return;
		}
		console.log(message);
	}

	addTimelineBuilder(timeline_builder: TimelineBuilder) {
		this._timelineBuilders.push(timeline_builder);
		timeline_builder.setParent(this);
	}
	timelineBuilders() {
		return this._timelineBuilders;
	}
	setParent(parent: TimelineBuilder) {
		this._parent = parent;
	}
	parent() {
		return this._parent;
	}

	setTarget(target: PropertyTarget) {
		this._target = target;
		for (let builder of this._timelineBuilders) {
			builder.setTarget(target);
		}
	}
	target() {
		return this._target;
	}
	setDuration(duration: number) {
		if (duration >= 0) {
			this._duration = duration;
			for (let builder of this._timelineBuilders) {
				builder.setDuration(duration);
			}
		}
	}
	duration() {
		return this._duration;
	}
	setEasing(easing: string) {
		this._easing = easing;
		for (let builder of this._timelineBuilders) {
			builder.setEasing(easing);
		}
	}
	easing() {
		return this._easing;
	}
	setOperation(operation: Operation) {
		this._operation = operation;
		for (let builder of this._timelineBuilders) {
			builder.setOperation(operation);
		}
	}
	operation() {
		return this._operation;
	}
	setRepeatParams(repeat_params: AnimationRepeatParams) {
		this._repeatParams = repeat_params;
		for (let builder of this._timelineBuilders) {
			builder.setRepeatParams(repeat_params);
		}
	}
	repeatParams() {
		return this._repeatParams;
	}
	setDelay(delay: number) {
		this._delay = delay;
		for (let builder of this._timelineBuilders) {
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
	setStoppable(state: boolean) {
		this._stoppable = state;
	}
	stoppable() {
		return this._stoppable;
	}

	setUpdateCallback(update_callback: AnimationUpdateCallback) {
		this._updateCallback = update_callback;
	}
	updateCallback() {
		return this._updateCallback;
	}
	// merge(timeline_builder?: TimelineBuilder) {
	// 	if (!timeline_builder) {
	// 		return;
	// 	}
	// }
	clone() {
		const newTimelineBuilder = new TimelineBuilder();
		newTimelineBuilder.setDuration(this._duration);
		newTimelineBuilder.setOperation(this._operation);
		newTimelineBuilder.setDelay(this._delay);

		if (this._target) {
			newTimelineBuilder.setTarget(this._target.clone());
		}
		if (this._easing) {
			newTimelineBuilder.setEasing(this._easing);
		}
		if (this._delay) {
			newTimelineBuilder.setDelay(this._delay);
		}
		if (this._updateCallback) {
			newTimelineBuilder.setUpdateCallback(this._updateCallback.clone());
		}
		if (this._repeatParams) {
			newTimelineBuilder.setRepeatParams({
				count: this._repeatParams.count,
				delay: this._repeatParams.delay,
				yoyo: this._repeatParams.yoyo,
			});
		}
		if (this._property) {
			const name = this._property.name();
			if (name) {
				newTimelineBuilder.setPropertyName(name);
			}
			const targetValue = this._property.targetValue();
			if (targetValue != null) {
				newTimelineBuilder.setPropertyValue(targetValue);
			}
		}
		if (this._position) {
			newTimelineBuilder.setPosition(this._position.clone());
		}
		newTimelineBuilder.setStoppable(this._stoppable);
		for (let childTimelineBuilder of this._timelineBuilders) {
			const newChildTimelineBuilder = childTimelineBuilder.clone();
			newTimelineBuilder.addTimelineBuilder(newChildTimelineBuilder);
		}
		return newTimelineBuilder;
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
	propertyValue() {
		return this._property?.targetValue();
	}

	populate(timeline: gsap.core.Timeline, options: RegisterOptions) {
		this._printDebug(['populate', this, timeline]);
		for (let timelineBuilder of this._timelineBuilders) {
			const subTimeline = gsap.timeline();
			timelineBuilder.setDebug(this._debug);
			timelineBuilder.populate(subTimeline, options);

			const position_param = timelineBuilder.position()?.toParameter() || undefined;
			timeline.add(subTimeline, position_param);
		}

		if (this._property && this._target) {
			this._property.setDebug(this._debug);
			this._property.addToTimeline({timelineBuilder: this, timeline, target: this._target, ...options});
		}
	}
}

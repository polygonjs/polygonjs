/**
 * Starts and pauses animations
 *
 *
 */
import {TypedEventNode} from './_Base';
import {EventContext} from '../../scene/utils/events/_BaseEventsController';
import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';
import {BaseNodeType} from '../_Base';
import {NodeContext} from '../../poly/NodeContext';
import {TimelineBuilder} from '../../../core/animation/TimelineBuilder';
import gsap from 'gsap';

enum AnimationEventInput {
	START = 'start',
	STOP = 'stop',
	UPDATE = 'update',
}
export enum AnimationEventOutput {
	START = 'start',
	COMPLETE = 'completed',
}

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {isBooleanTrue} from '../../../core/Type';
class AnimationEventParamsConfig extends NodeParamsConfig {
	/** @parm animation node */
	animation = ParamConfig.NODE_PATH('', {
		nodeSelection: {context: NodeContext.ANIM},
		dependentOnFoundNode: false,
	});
	/** @parm presses to play the animation */
	play = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			AnimationEventNode.PARAM_CALLBACK_play(node as AnimationEventNode);
		},
	});
	/** @parm presses to pause the animation */
	pause = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			AnimationEventNode.PARAM_CALLBACK_pause(node as AnimationEventNode);
		},
	});
	/** @param stops previous animations still in progress started by this node */
	stopsPreviousAnim = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new AnimationEventParamsConfig();

export class AnimationEventNode extends TypedEventNode<AnimationEventParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'animation';
	}

	private _timelineBuilder: TimelineBuilder | undefined;
	private _timeline: gsap.core.Timeline | undefined;

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new EventConnectionPoint(AnimationEventInput.START, EventConnectionPointType.BASE, this._play.bind(this)),
			new EventConnectionPoint(AnimationEventInput.STOP, EventConnectionPointType.BASE, this._pause.bind(this)),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new EventConnectionPoint(AnimationEventOutput.START, EventConnectionPointType.BASE),
			new EventConnectionPoint(AnimationEventOutput.COMPLETE, EventConnectionPointType.BASE),
		]);
	}

	override processEvent(event_context: EventContext<Event>) {
		// this.dispatchEventToOutput(OUTPUT_NAME, event_context);
	}

	static PARAM_CALLBACK_play(node: AnimationEventNode) {
		node._play({});
	}
	static PARAM_CALLBACK_pause(node: AnimationEventNode) {
		node._pause();
	}

	private async _play(event_context: EventContext<Event>) {
		const param = this.p.animation;
		if (param.isDirty()) {
			await param.compute();
		}
		const node = param.value.nodeWithContext(NodeContext.ANIM);
		if (!node) {
			return;
		}
		const container = await node.compute();
		if (!container) {
			return;
		}
		this._timelineBuilder = container.coreContent();
		if (!this._timelineBuilder) {
			return;
		}
		if (this._timeline && isBooleanTrue(this.pv.stopsPreviousAnim)) {
			this._timeline.kill();
		}
		this._timeline = gsap.timeline();

		this._timelineBuilder.populate(this._timeline);
		this._timeline.vars.onStart = () => {
			this._triggerAnimationStarted(event_context);
		};
		this._timeline.vars.onComplete = () => {
			this._triggerAnimationCompleted(event_context);
		};
	}
	private _pause() {
		if (this._timeline) {
			this._timeline.pause();
		}
	}

	private _triggerAnimationStarted(event_context: EventContext<Event>) {
		this.dispatchEventToOutput(AnimationEventOutput.START, event_context);
	}
	private _triggerAnimationCompleted(event_context: EventContext<Event>) {
		this.dispatchEventToOutput(AnimationEventOutput.COMPLETE, event_context);
	}
}

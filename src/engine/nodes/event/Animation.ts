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
enum AnimationEventOutput {
	START = 'start',
	COMPLETE = 'completed',
}

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class AnimationEventParamsConfig extends NodeParamsConfig {
	/** @parm animation node */
	animation = ParamConfig.OPERATOR_PATH('/ANIM/OUT', {
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
}
const ParamsConfig = new AnimationEventParamsConfig();

export class AnimationEventNode extends TypedEventNode<AnimationEventParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'animation';
	}

	private _timeline_builder: TimelineBuilder | undefined;
	private _timeline: gsap.core.Timeline | undefined;

	initialize_node() {
		this.io.inputs.set_named_input_connection_points([
			new EventConnectionPoint(AnimationEventInput.START, EventConnectionPointType.BASE, this._play.bind(this)),
			new EventConnectionPoint(AnimationEventInput.STOP, EventConnectionPointType.BASE, this._pause.bind(this)),
		]);

		this.io.outputs.set_named_output_connection_points([
			new EventConnectionPoint(AnimationEventOutput.START, EventConnectionPointType.BASE),
			new EventConnectionPoint(AnimationEventOutput.COMPLETE, EventConnectionPointType.BASE),
		]);
	}

	process_event(event_context: EventContext<Event>) {
		// this.dispatch_event_to_output(OUTPUT_NAME, event_context);
	}

	static PARAM_CALLBACK_play(node: AnimationEventNode) {
		node._play({});
	}
	static PARAM_CALLBACK_pause(node: AnimationEventNode) {
		node._pause();
	}

	private async _play(event_context: EventContext<Event>) {
		const param = this.p.animation;
		if (param.is_dirty) {
			await param.compute();
		}
		const node = param.found_node_with_context(NodeContext.ANIM);
		if (!node) {
			return;
		}
		const container = await node.request_container();
		if (!container) {
			return;
		}
		this._timeline_builder = container.core_content();
		if (!this._timeline_builder) {
			return;
		}
		if (this._timeline) {
			this._timeline.kill();
		}
		this._timeline = gsap.timeline();

		this._timeline_builder.populate(this._timeline, this.scene);

		this._timeline.vars.onStart = () => {
			this.trigger_animation_started(event_context);
		};
		this._timeline.vars.onComplete = () => {
			if (this._timeline) {
				this._timeline.kill();
			}
			this.trigger_animation_completed(event_context);
		};
	}
	private _pause() {
		if (this._timeline) {
			this._timeline.pause();
		}
	}

	trigger_animation_started(event_context: EventContext<Event>) {
		this.dispatch_event_to_output(AnimationEventOutput.START, event_context);
	}
	trigger_animation_completed(event_context: EventContext<Event>) {
		this.dispatch_event_to_output(AnimationEventOutput.COMPLETE, event_context);
	}
}

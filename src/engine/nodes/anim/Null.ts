/**
 * shows controls to play and pause animation properties
 *
 */
import {TypedAnimNode} from './_Base';
import {TimelineBuilder} from '../../../core/animation/TimelineBuilder';
import {BaseNodeType} from '../_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {Poly} from '../../Poly';
import {gsapTimeline, GsapCoreTimeline} from '../../../core/thirdParty/gsap';

class NullAnimParamsConfig extends NodeParamsConfig {
	/** @param play the animations */
	play = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			NullAnimNode.PARAM_CALLBACK_play(node as NullAnimNode);
		},
		hidden: true,
	});
	/** @param pause the animations */
	pause = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			NullAnimNode.PARAM_CALLBACK_pause(node as NullAnimNode);
		},
		hidden: true,
	});
	/** @param sets if the animations created can be stopped when a new animation in generated on the same property */
	stoppable = ParamConfig.BOOLEAN(1);
	/** @param toggle to see debug infos printed in the console */
	debug = ParamConfig.BOOLEAN(0);
}
const ParamsConfig = new NullAnimParamsConfig();

export class NullAnimNode extends TypedAnimNode<NullAnimParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'null';
	}

	override initializeNode() {
		this.io.inputs.setCount(0, 1);
	}

	override cook(inputContents: TimelineBuilder[]) {
		const timelineBuilder = inputContents[0] || new TimelineBuilder();
		timelineBuilder.setDebug(isBooleanTrue(this.pv.debug));
		timelineBuilder.setStoppable(this.pv.stoppable);
		this.setTimelineBuilder(timelineBuilder);
	}

	// private _timelineBuilder: TimelineBuilder | undefined;
	private _timeline: GsapCoreTimeline | undefined;
	async timelineBuilder() {
		const container = await this.compute();
		if (!container) {
			return;
		}
		const timelineBuilder = container.coreContent();
		if (!timelineBuilder) {
			return;
		}
		return timelineBuilder;
	}
	async play(): Promise<void> {
		return new Promise(async (playResolve) => {
			if (isBooleanTrue(this.pv.debug)) {
				Poly.log(`play from '${this.path()}'`);
			}

			let resolved = false;
			function resolveOnce() {
				if (!resolved) {
					resolved = true;
					playResolve();
				}
			}
			const timelineBuilder = await this.timelineBuilder();
			if (!timelineBuilder) {
				return;
			}
			this._timeline = gsapTimeline({onComplete: resolveOnce});
			timelineBuilder.populate(this._timeline, {registerproperties: true});
			// if the timeline is empty, we resolve the promise now
			// not needed since gsap 3.7.0 ( https://github.com/greensock/GSAP/issues/448 )
			// if (this._timeline.getChildren().length == 0 || this._timeline.totalDuration() == 0) {
			// 	Poly.warn(`timeline created by ${this.path()} is empty`);
			// 	resolveOnce();
			// }
		});
	}
	async pause() {
		if (this._timeline) {
			this._timeline.pause();
		}
	}
	static PARAM_CALLBACK_play(node: NullAnimNode) {
		node.play();
	}
	static PARAM_CALLBACK_pause(node: NullAnimNode) {
		node.pause();
	}
}

/**
 * shows controls to play, reset and seek an animation setup
 *
 */
import {TypedAnimNode} from './_Base';
import {TimelineBuilder} from '../../../core/animation/TimelineBuilder';
import {BaseNodeType} from '../_Base';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {Poly} from '../../Poly';
import {GsapCoreTimeline, gsapTimeline, gsap} from '../../../core/thirdParty/gsap';
import {AnimType} from '../../poly/registers/nodes/types/Anim';

class PlayAnimParamsConfig extends NodeParamsConfig {
	/** @param play the animations */
	play = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			PlayAnimNode.PARAM_CALLBACK_play(node as PlayAnimNode);
		},
		hidden: true,
	});
	/** @param pause the animations */
	pause = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			PlayAnimNode.PARAM_CALLBACK_pause(node as PlayAnimNode);
		},
		hidden: true,
	});
	/** @param reset the animations */
	reset = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			PlayAnimNode.PARAM_CALLBACK_reset(node as PlayAnimNode);
		},
		hidden: true,
	});
	/** @param sets if the animations created can be stopped when a new animation in generated on the same property */
	stoppable = ParamConfig.BOOLEAN(1);
	/** @param toggle to see debug infos printed in the console */
	debug = ParamConfig.BOOLEAN(0);

	/** @param seek */
	seek = ParamConfig.FLOAT(0, {
		range: [0, 1],
		rangeLocked: [true, true],
		cook: false,
		callback: (node: BaseNodeType) => {
			PlayAnimNode.PARAM_CALLBACK_seek(node as PlayAnimNode);
		},
	});
}
const ParamsConfig = new PlayAnimParamsConfig();

export class PlayAnimNode extends TypedAnimNode<PlayAnimParamsConfig> {
	override paramsConfig = ParamsConfig;
	public gsap = gsap; // give access to gsap to external scripts
	static override type() {
		return AnimType.PLAY;
	}
	override initializeNode() {
		this.io.inputs.setCount(2);
	}

	override cook(inputContents: TimelineBuilder[]) {
		const timelineBuilder = inputContents[0] || new TimelineBuilder();
		this.setTimelineBuilder(timelineBuilder);
	}

	// private _timelineBuilder: TimelineBuilder | undefined;
	private _timeline: GsapCoreTimeline | undefined;
	async timelineBuilder(inputIndex: number) {
		const inputNode = this.io.inputs.input(inputIndex);
		if (!inputNode) {
			return;
		}
		const container = await inputNode.compute();
		if (!container) {
			return;
		}
		const timelineBuilder = container.coreContentCloned();
		if (!timelineBuilder) {
			return;
		}
		timelineBuilder.setDebug(isBooleanTrue(this.pv.debug));
		timelineBuilder.setStoppable(this.pv.stoppable);

		return timelineBuilder;
	}
	private async _playFromInput(inputIndex: number): Promise<void> {
		return new Promise(async (playResolve) => {
			let resolved = false;
			function resolveOnce() {
				if (!resolved) {
					resolved = true;
					playResolve();
				}
			}
			const timelineBuilder = await this.timelineBuilder(inputIndex);
			if (!timelineBuilder) {
				return;
			}
			this._timeline = gsapTimeline({onComplete: resolveOnce});
			timelineBuilder.populate(this._timeline, {registerproperties: true});
		});
	}
	async play(): Promise<void> {
		if (isBooleanTrue(this.pv.debug)) {
			Poly.log(`play from '${this.path()}'`);
		}
		return await this._playFromInput(1);
	}
	async reset(): Promise<void> {
		if (isBooleanTrue(this.pv.debug)) {
			Poly.log(`reset from '${this.path()}'`);
		}
		return await this._playFromInput(0);
	}
	async pause() {
		if (this._timeline) {
			this._timeline.pause();
		}
	}
	async seek() {
		const timelineBuilder0 = await this.timelineBuilder(0);
		const timelineBuilder1 = await this.timelineBuilder(1);
		if (!(timelineBuilder0 && timelineBuilder1)) {
			return;
		}
		// reset
		const timeline0 = gsapTimeline({paused: true});
		timelineBuilder0.populate(timeline0, {registerproperties: false});
		timeline0.seek(timeline0.duration());
		timeline0.kill();

		// seek
		const timeline1 = gsapTimeline({paused: true});
		timelineBuilder1.populate(timeline1, {registerproperties: false});
		timeline1.seek(this.pv.seek * timeline1.duration(), false);
		timeline1.kill();
	}
	static PARAM_CALLBACK_play(node: PlayAnimNode) {
		node.play();
	}
	static PARAM_CALLBACK_pause(node: PlayAnimNode) {
		node.pause();
	}
	static PARAM_CALLBACK_reset(node: PlayAnimNode) {
		node.reset();
	}
	static PARAM_CALLBACK_seek(node: PlayAnimNode) {
		node.seek();
	}
}

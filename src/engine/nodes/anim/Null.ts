/**
 * shows controls to play and pause animation properties
 *
 */
import {TypedAnimNode} from './_Base';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {TimelineBuilder} from '../../../core/animation/TimelineBuilder';
import gsap from 'gsap';
import {BaseNodeType} from '../_Base';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {Poly} from '../../Poly';
class NullAnimParamsConfig extends NodeParamsConfig {
	/** @param play the animations */
	play = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			NullAnimNode.PARAM_CALLBACK_play(node as NullAnimNode);
		},
	});
	/** @param pause the animations */
	pause = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			NullAnimNode.PARAM_CALLBACK_pause(node as NullAnimNode);
		},
	});
	/** @param toggle to see debug infos printed in the console */
	debug = ParamConfig.BOOLEAN(0);
}
const ParamsConfig = new NullAnimParamsConfig();

export class NullAnimNode extends TypedAnimNode<NullAnimParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'null';
	}

	initializeNode() {
		this.io.inputs.setCount(0, 1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	cook(inputContents: TimelineBuilder[]) {
		const timelineBuilder = inputContents[0] || new TimelineBuilder();
		this.setTimelineBuilder(timelineBuilder);
	}

	private _timelineBuilder: TimelineBuilder | undefined;
	private _timeline: gsap.core.Timeline | undefined;
	async play(): Promise<void> {
		return new Promise(async (resolve) => {
			const container = await this.compute();
			if (!container) {
				return;
			}
			this._timelineBuilder = container.coreContent();
			if (!this._timelineBuilder) {
				return;
			}
			if (this._timeline) {
				this._timeline.kill();
			}
			let resolved = false;
			function resolveOnce() {
				if (!resolved) {
					resolved = true;
					resolve();
				}
			}
			this._timeline = gsap.timeline({onComplete: resolveOnce});

			if (isBooleanTrue(this.pv.debug)) {
				Poly.log(`play from '${this.path()}'`);
			}

			(this._timeline as any).pjsid = Math.random();
			this._timelineBuilder.setDebug(isBooleanTrue(this.pv.debug));
			this._timelineBuilder.populate(this._timeline);

			// if the timeline is empty, we resolve the promise now
			if (this._timeline.getChildren().length == 0 || this._timeline.totalDuration() == 0) {
				Poly.warn(`timeline created by ${this.path()} is empty`);
				resolveOnce();
			}
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

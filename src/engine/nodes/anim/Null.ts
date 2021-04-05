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

	cook(input_contents: TimelineBuilder[]) {
		const timeline_builder = input_contents[0] || new TimelineBuilder();
		this.setTimelineBuilder(timeline_builder);
	}

	private _timeline_builder: TimelineBuilder | undefined;
	private _timeline: gsap.core.Timeline | undefined;
	async play() {
		return new Promise(async (resolve) => {
			const container = await this.compute();
			if (!container) {
				return;
			}
			this._timeline_builder = container.coreContent();
			if (!this._timeline_builder) {
				return;
			}
			if (this._timeline) {
				this._timeline.kill();
			}
			this._timeline = gsap.timeline({onComplete: resolve});

			if (isBooleanTrue(this.pv.debug)) {
				console.log(`play from '${this.path()}'`);
			}

			this._timeline_builder.setDebug(isBooleanTrue(this.pv.debug));
			this._timeline_builder.populate(this._timeline);
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

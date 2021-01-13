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
}
const ParamsConfig = new NullAnimParamsConfig();

export class NullAnimNode extends TypedAnimNode<NullAnimParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'null';
	}

	initialize_node() {
		this.io.inputs.set_count(0, 1);
		this.io.inputs.init_inputs_cloned_state(InputCloneMode.FROM_NODE);
	}

	cook(input_contents: TimelineBuilder[]) {
		const timeline_builder = input_contents[0] || new TimelineBuilder();
		this.set_timeline_builder(timeline_builder);
	}

	private _timeline_builder: TimelineBuilder | undefined;
	private _timeline: gsap.core.Timeline | undefined;
	async play() {
		return new Promise(async (resolve) => {
			const container = await this.requestContainer();
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

			this._timeline_builder.populate(this._timeline, this.scene());
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

import {TypedAnimNode} from './_Base';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {TimelineBuilder} from '../../../core/animation/TimelineBuilder';
import gsap from 'gsap';
import {BaseNodeType} from '../_Base';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class NullAnimParamsConfig extends NodeParamsConfig {
	play = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			NullAnimNode.PARAM_CALLBACK_play(node as NullAnimNode);
		},
	});
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
	private async _play() {
		const container = await this.request_container();
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
	}
	private async _pause() {
		if (this._timeline) {
			this._timeline.pause();
		}
	}
	static PARAM_CALLBACK_play(node: NullAnimNode) {
		node._play();
	}
	static PARAM_CALLBACK_pause(node: NullAnimNode) {
		node._pause();
	}
}

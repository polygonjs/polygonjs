/**
 * Adds a delay to animation properties
 *
 *
 */
import {TypedAnimNode} from './_Base';
import {TimelineBuilder} from '../../../core/animation/TimelineBuilder';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class DelayAnimParamsConfig extends NodeParamsConfig {
	/** @param delay */
	delay = ParamConfig.FLOAT(1);
}
const ParamsConfig = new DelayAnimParamsConfig();

export class DelayAnimNode extends TypedAnimNode<DelayAnimParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'delay';
	}

	initializeNode() {
		this.io.inputs.setCount(0, 1);

		this.scene().dispatchController.onAddListener(() => {
			this.params.onParamsCreated('params_label', () => {
				this.params.label.init([this.p.delay]);
			});
		});
	}

	cook(input_contents: TimelineBuilder[]) {
		const timeline_builder = input_contents[0] || new TimelineBuilder();

		timeline_builder.setDelay(this.pv.delay);

		this.set_timeline_builder(timeline_builder);
	}
}

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

	initialize_node() {
		this.io.inputs.set_count(0, 1);

		this.scene.dispatchController.onAddListener(() => {
			this.params.on_params_created('params_label', () => {
				this.params.label.init([this.p.delay]);
			});
		});
	}

	cook(input_contents: TimelineBuilder[]) {
		const timeline_builder = input_contents[0] || new TimelineBuilder();

		timeline_builder.set_delay(this.pv.delay);

		this.set_timeline_builder(timeline_builder);
	}
}

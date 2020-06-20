import {TypedAnimNode} from './_Base';
import {TimelineBuilder} from '../../../core/animation/TimelineBuilder';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class DurationAnimParamsConfig extends NodeParamsConfig {
	duration = ParamConfig.FLOAT(1, {
		range: [0, 10],
		range_locked: [true, false],
	});
}
const ParamsConfig = new DurationAnimParamsConfig();

export class DurationAnimNode extends TypedAnimNode<DurationAnimParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'duration';
	}

	initialize_node() {
		this.io.inputs.set_count(0, 1);

		this.scene.dispatch_controller.on_add_listener(() => {
			this.params.on_params_created('params_label', () => {
				this.params.label.init([this.p.duration]);
			});
		});
	}

	cook(input_contents: TimelineBuilder[]) {
		const timeline_builder = input_contents[0] || new TimelineBuilder();

		timeline_builder.set_duration(this.pv.duration);

		this.set_timeline_builder(timeline_builder);
	}
}

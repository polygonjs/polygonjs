/**
 * Sets the duration of an animation
 *
 *
 */
import {TypedAnimNode} from './_Base';
import {TimelineBuilder} from '../../../core/animation/TimelineBuilder';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class DurationAnimParamsConfig extends NodeParamsConfig {
	/** @param duration */
	duration = ParamConfig.FLOAT(1, {
		range: [0, 10],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new DurationAnimParamsConfig();

export class DurationAnimNode extends TypedAnimNode<DurationAnimParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'duration';
	}

	initializeNode() {
		this.io.inputs.setCount(0, 1);

		this.scene().dispatchController.onAddListener(() => {
			this.params.onParamsCreated('params_label', () => {
				this.params.label.init([this.p.duration]);
			});
		});
	}

	cook(input_contents: TimelineBuilder[]) {
		const timeline_builder = input_contents[0] || new TimelineBuilder();

		timeline_builder.setDuration(this.pv.duration);

		this.set_timeline_builder(timeline_builder);
	}
}

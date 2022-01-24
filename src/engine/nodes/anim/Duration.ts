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
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'duration';
	}

	override initializeNode() {
		this.io.inputs.setCount(0, 1);
	}

	override cook(input_contents: TimelineBuilder[]) {
		const timeline_builder = input_contents[0] || new TimelineBuilder();

		timeline_builder.setDuration(this.pv.duration);

		this.setTimelineBuilder(timeline_builder);
	}
}

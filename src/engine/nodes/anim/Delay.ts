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
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'delay';
	}

	override initializeNode() {
		this.io.inputs.setCount(0, 1);
	}

	override cook(input_contents: TimelineBuilder[]) {
		const timeline_builder = input_contents[0] || new TimelineBuilder();

		timeline_builder.setDelay(this.pv.delay);

		this.setTimelineBuilder(timeline_builder);
	}
}

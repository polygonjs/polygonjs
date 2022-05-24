/**
 * Sets if the animation should repeat
 *
 *
 */
import {TypedAnimNode} from './_Base';
import {TimelineBuilder} from '../../../core/animation/TimelineBuilder';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {AnimationRepeatParams} from '../../../core/animation/vars/AnimBuilderTypes';
class RepeatAnimParamsConfig extends NodeParamsConfig {
	/** @param sets if it should repeat indefinitely */
	unlimited = ParamConfig.BOOLEAN(0);
	/** @param number of times the animation should repeat */
	count = ParamConfig.INTEGER(1, {
		range: [0, 10],
		visibleIf: {unlimited: 0},
	});
	/** @param delay */
	delay = ParamConfig.FLOAT(0);
	/** @param sets if the animation should go back and forth at each repeat */
	yoyo = ParamConfig.BOOLEAN(0);
}
const ParamsConfig = new RepeatAnimParamsConfig();

export class RepeatAnimNode extends TypedAnimNode<RepeatAnimParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'repeat';
	}

	override initializeNode() {
		this.io.inputs.setCount(0, 1);
	}

	private _repeat_params(): AnimationRepeatParams {
		return {
			count: isBooleanTrue(this.pv.unlimited) ? -1 : this.pv.count,
			delay: this.pv.delay,
			yoyo: isBooleanTrue(this.pv.yoyo),
		};
	}

	override cook(input_contents: TimelineBuilder[]) {
		const timeline_builder = input_contents[0] || new TimelineBuilder();

		timeline_builder.setRepeatParams(this._repeat_params());

		this.setTimelineBuilder(timeline_builder);
	}
}

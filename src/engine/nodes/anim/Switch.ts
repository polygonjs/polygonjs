/**
 * Switch between animation properties
 *
 *
 */
import {TypedAnimNode} from './_Base';
import {TimelineBuilder} from '../../../core/animation/TimelineBuilder';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class SwitchAnimParamsConfig extends NodeParamsConfig {
	/** @param input to process */
	input = ParamConfig.INTEGER(0, {
		range: [0, 3],
		rangeLocked: [true, true],
	});
}
const ParamsConfig = new SwitchAnimParamsConfig();

export class SwitchAnimNode extends TypedAnimNode<SwitchAnimParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'switch';
	}

	initializeNode() {
		this.io.inputs.setCount(0, 4);
	}

	cook(input_contents: TimelineBuilder[]) {
		const timeline_builder = input_contents[this.pv.input];
		if (timeline_builder) {
			this.setTimelineBuilder(timeline_builder);
		} else {
			this.states.error.set(`input ${this.pv.input} is not valid`);
		}
	}
}

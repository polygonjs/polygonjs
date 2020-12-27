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
	params_config = ParamsConfig;
	static type() {
		return 'switch';
	}

	initialize_node() {
		this.io.inputs.set_count(0, 4);
	}

	cook(input_contents: TimelineBuilder[]) {
		const timeline_builder = input_contents[this.pv.input];
		if (timeline_builder) {
			this.set_timeline_builder(timeline_builder);
		} else {
			this.states.error.set(`input ${this.pv.input} is not valid`);
		}
	}
}

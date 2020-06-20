import {TypedAnimNode} from './_Base';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {TimelineBuilder} from '../../../core/animation/TimelineBuilder';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
class NullAnimParamsConfig extends NodeParamsConfig {}
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
}

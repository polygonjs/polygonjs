import {TypedAnimNode} from './_Base';
import {TimelineBuilder} from '../../../core/animation/TimelineBuilder';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
class MergeAnimParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new MergeAnimParamsConfig();

export class MergeAnimNode extends TypedAnimNode<MergeAnimParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'merge';
	}

	initialize_node() {
		this.io.inputs.set_count(0, 4);
	}

	cook(input_contents: TimelineBuilder[]) {
		const merged_timeline_builder = new TimelineBuilder();

		for (let timeline_builder of input_contents) {
			if (timeline_builder) {
				merged_timeline_builder.add_timeline_builder(timeline_builder);
			}
		}

		this.set_timeline_builder(merged_timeline_builder);
	}
}

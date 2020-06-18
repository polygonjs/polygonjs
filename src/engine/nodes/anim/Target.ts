import {TypedAnimNode} from './_Base';
import {TimelineBuilder} from '../../../core/animation/TimelineBuilder';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class TargetAnimParamsConfig extends NodeParamsConfig {
	name = ParamConfig.STRING('/geo1');
}
const ParamsConfig = new TargetAnimParamsConfig();

export class TargetAnimNode extends TypedAnimNode<TargetAnimParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'target';
	}

	initialize_node() {
		this.io.inputs.set_count(0, 1);

		this.scene.dispatch_controller.on_add_listener(() => {
			this.params.on_params_created('params_label', () => {
				this.params.label.init([this.p.name]);
			});
		});
	}

	cook(input_contents: TimelineBuilder[]) {
		const timeline_builder = input_contents[0];

		const properties = timeline_builder.properties();
		for (let property of properties) {
			property.set_target_mask(this.pv.name);
		}

		this.set_timeline_builder(timeline_builder);
	}
}

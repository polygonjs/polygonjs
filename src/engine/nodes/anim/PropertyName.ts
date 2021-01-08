/**
 * Name of the property the animation will be applied to
 *
 *
 */
import {TypedAnimNode} from './_Base';
import {TimelineBuilder} from '../../../core/animation/TimelineBuilder';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class PropertyNameAnimParamsConfig extends NodeParamsConfig {
	/** @param name */
	name = ParamConfig.STRING('position');
}
const ParamsConfig = new PropertyNameAnimParamsConfig();

export class PropertyNameAnimNode extends TypedAnimNode<PropertyNameAnimParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'propertyName';
	}

	initialize_node() {
		this.io.inputs.set_count(0, 1);

		this.scene.dispatchController.onAddListener(() => {
			this.params.on_params_created('params_label', () => {
				this.params.label.init([this.p.name]);
			});
		});
	}

	cook(input_contents: TimelineBuilder[]) {
		const timeline_builder = input_contents[0] || new TimelineBuilder();

		timeline_builder.setPropertyName(this.pv.name);

		this.set_timeline_builder(timeline_builder);
	}
}

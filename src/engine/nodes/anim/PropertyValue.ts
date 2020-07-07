import {TypedAnimNode} from './_Base';
import {TimelineBuilder} from '../../../core/animation/TimelineBuilder';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class PropertyValueAnimParamsConfig extends NodeParamsConfig {
	size = ParamConfig.INTEGER(3, {
		range: [1, 4],
		range_locked: [true, true],
	});
	value1 = ParamConfig.FLOAT(0, {
		visible_if: {size: 1},
	});
	value2 = ParamConfig.VECTOR2([0, 0], {
		visible_if: {size: 2},
	});
	value3 = ParamConfig.VECTOR3([0, 0, 0], {
		visible_if: {size: 3},
	});
	value4 = ParamConfig.VECTOR4([0, 0, 0, 0], {
		visible_if: {size: 4},
	});
}
const ParamsConfig = new PropertyValueAnimParamsConfig();

export class PropertyValueAnimNode extends TypedAnimNode<PropertyValueAnimParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'property_value';
	}

	initialize_node() {
		this.io.inputs.set_count(0, 1);
	}

	cook(input_contents: TimelineBuilder[]) {
		const timeline_builder = input_contents[0] || new TimelineBuilder();

		const target_value = [this.pv.value1, this.pv.value2.clone(), this.pv.value3.clone(), this.pv.value4.clone()][
			this.pv.size - 1
		];

		timeline_builder.set_property_value(target_value);

		this.set_timeline_builder(timeline_builder);
	}
}

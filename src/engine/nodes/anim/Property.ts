import {TypedAnimNode} from './_Base';
import {TimelineBuilder} from '../../../core/animation/TimelineBuilder';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {TimelineBuilderProperty} from '../../../core/animation/TimelineBuilderProperty';
class TrackAnimParamsConfig extends NodeParamsConfig {
	name = ParamConfig.STRING('position');
	size = ParamConfig.INTEGER(3, {
		range: [1, 4],
		range_locked: [true, true],
	});
	value1 = ParamConfig.FLOAT(0, {
		visible_if: {size: 1},
		expression: {for_entities: true},
	});
	value2 = ParamConfig.VECTOR2([0, 0], {
		visible_if: {size: 2},
		expression: {for_entities: true},
	});
	value3 = ParamConfig.VECTOR3([0, 0, 0], {
		visible_if: {size: 3},
		expression: {for_entities: true},
	});
	value4 = ParamConfig.VECTOR4([0, 0, 0, 0], {
		visible_if: {size: 4},
		expression: {for_entities: true},
	});
	update_matrix = ParamConfig.BOOLEAN(0);
}
const ParamsConfig = new TrackAnimParamsConfig();

export class PropertyAnimNode extends TypedAnimNode<TrackAnimParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'property';
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
		const timeline_builder = input_contents[0] || new TimelineBuilder();

		const target_value = [this.pv.value1, this.pv.value2, this.pv.value3, this.pv.value4][this.pv.size - 1];
		const timeline_builder_property = new TimelineBuilderProperty(
			this.pv.name,
			target_value,
			this.pv.update_matrix
		);

		timeline_builder.add_property(timeline_builder_property);

		this.set_timeline_builder(timeline_builder);
	}
}

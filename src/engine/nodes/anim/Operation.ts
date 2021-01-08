/**
 * Sets how the animation is applied
 *
 * @remarks
 * The animation can be set to:
 *
 * - set: the animation override the current value
 * - add: the animation adds to the current value
 * substract: the animation substracts from the current value
 *
 */
import {TypedAnimNode} from './_Base';
import {TimelineBuilder, OPERATIONS} from '../../../core/animation/TimelineBuilder';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class OperationAnimParamsConfig extends NodeParamsConfig {
	/** @param sets the operation (set, add or substract) */
	operation = ParamConfig.INTEGER(0, {
		menu: {
			entries: OPERATIONS.map((name, value) => {
				return {value, name};
			}),
		},
	});
}
const ParamsConfig = new OperationAnimParamsConfig();

export class OperationAnimNode extends TypedAnimNode<OperationAnimParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'operation';
	}

	initialize_node() {
		this.io.inputs.set_count(0, 1);

		this.scene.dispatchController.onAddListener(() => {
			this.params.on_params_created('params_label', () => {
				this.params.label.init([this.p.operation], () => {
					return OPERATIONS[this.pv.operation];
				});
			});
		});
	}

	cook(input_contents: TimelineBuilder[]) {
		const timeline_builder = input_contents[0] || new TimelineBuilder();

		timeline_builder.set_operation(OPERATIONS[this.pv.operation]);

		this.set_timeline_builder(timeline_builder);
	}
}

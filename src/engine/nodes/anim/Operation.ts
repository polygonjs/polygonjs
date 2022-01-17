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
	paramsConfig = ParamsConfig;
	static type() {
		return 'operation';
	}

	initializeNode() {
		this.io.inputs.setCount(0, 1);
	}

	cook(input_contents: TimelineBuilder[]) {
		const timeline_builder = input_contents[0] || new TimelineBuilder();

		timeline_builder.setOperation(OPERATIONS[this.pv.operation]);

		this.setTimelineBuilder(timeline_builder);
	}
}
